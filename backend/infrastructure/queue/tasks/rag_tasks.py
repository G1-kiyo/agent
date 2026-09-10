import json
from typing import Optional
from celery import chain
from infrastructure.logging.logger import logger_handler
from celery_app import celery_app
from infrastructure.cache.redis_client import get_sync_redis
from pydantic import BaseModel
from capabilities.rag.embeddings import load_documents_from_file,split_documents,generate_document_vectors
from capabilities.rag.vector_store import store_document_vectors,get_qdrant

class ProgressRecord(dict):
    exec_name: str
    doc_index: Optional[int]
    progress: float
    is_last: int

class TaskInfo(dict):
    batch_id: str
    doc_index: int
    source_url: Optional[str]
    is_last: int

class TaskResult(dict):
    key: str
    task_info: TaskInfo

def record_progress(batch_id:str,record: ProgressRecord):
    r = get_sync_redis()
    r.hset(f"knowledge:progress:{batch_id}",mapping=record)
def save_temp_data(key,val):
    r = get_sync_redis()
    r.hset(key,mapping={
        "list":json.dumps(val)
    })

def get_temp_data(key):
    r = get_sync_redis()
    stored = r.hget(key,"list")
    return json.loads(stored)

def get_all_data(key):
    r = get_sync_redis()
    stored = r.hgetall(key)
    return dict(stored)

@celery_app.task
@logger_handler("knowledge")
# 定义子任务1:加载原始文件
def sub_task_1(task_info:TaskInfo,file:str):
    batch_id = task_info.get("batch_id")
    doc_index = task_info.get("doc_index")
    is_last = task_info.get("is_last")
    # 准备加载
    record_progress(batch_id,ProgressRecord({"exec_name":"准备加载原始文件","doc_index":doc_index,"progress":10,"is_last":is_last}))
    documents,doc_name = load_documents_from_file(file)
    # 拿到的是list[Document]
    # 转换一下转成存储里面的pagecontent
    document_content_list = [doc.page_content for doc in documents]
    key = f"knowledge:docs:{batch_id}:{doc_index}"
    save_temp_data(key,document_content_list)
    # 加载完毕
    record_progress(batch_id,ProgressRecord({"exec_name":"加载原始文件完毕","doc_index":doc_index,"progress":20,"is_last":is_last}))
    return TaskResult({"key":key,"task_info":task_info})


@celery_app.task
@logger_handler("knowledge")
# 定义子任务2:分块
def sub_task_2(prev_task_result:TaskResult):
    doc_key = prev_task_result.get("key")
    task_info = prev_task_result.get("task_info")
    batch_id = task_info.get("batch_id")
    doc_index = task_info.get("doc_index")
    is_last = task_info.get("is_last")
    # 准备分块
    docs = get_temp_data(doc_key) 
    # doc列表，每个doc都产生对应的chunks列表
    record_progress(batch_id,ProgressRecord({"exec_name":"准备文档分块","doc_index":doc_index,"progress":30,"is_last":is_last}))
    splited_chunks = []
    for doc in docs:
        chunks = split_documents(doc)
        splited_chunks.extend(chunks)

    key = f"knowledge:chunks:{batch_id}:{doc_index}"
    save_temp_data(key,splited_chunks)
    # 加载完毕 
    record_progress(batch_id,ProgressRecord({"exec_name":"文档分块完毕","doc_index":doc_index,"progress":45,"is_last":is_last}))
    return TaskResult({"key":key,"task_info":task_info})


@celery_app.task
@logger_handler("knowledge")
# 定义子任务3:内容向量化
def sub_task_3(prev_task_result:TaskResult):
    chunk_key = prev_task_result.get("key")
    task_info = prev_task_result.get("task_info")
    batch_id = task_info.get("batch_id")
    doc_index = task_info.get("doc_index")
    is_last = task_info.get("is_last")
    input_points = []
    # 准备向量化存储 
    chunks = get_temp_data(chunk_key)
    record_progress(batch_id,ProgressRecord({"exec_name":"准备向量转换","doc_index":doc_index,"progress":60,"is_last":is_last}))
    for i, chunk in enumerate(chunks):
        vector = generate_document_vectors(chunk)
        # print(f"vector>>:{vector}")
        input_points.append(
            {
                "vector": vector,
                "payload": {
                    "source_url": task_info.get("source_url"),
                    "doc_index": task_info.get("doc_index"),
                    "chunk_index":i,
                    "content":chunk
                },
            }
        )
    key = f"knowledge:vectors:{batch_id}:{doc_index}"
    save_temp_data(key,input_points)
    record_progress(
        batch_id, ProgressRecord({"exec_name":"向量转换完毕","doc_index":doc_index,"progress":75,"is_last":is_last})
    )
    return TaskResult({"key":key,"task_info":task_info})
    

@celery_app.task
@logger_handler("knowledge")
# 定义子任务4:向量存储
def sub_task_4(prev_task_result:TaskResult):
    qdrant = get_qdrant()
    vector_key = prev_task_result.get("key")
    task_info = prev_task_result.get("task_info")
    batch_id = task_info.get("batch_id")
    doc_index = task_info.get("doc_index")
    is_last = task_info.get("is_last")
    # 准备向量化存储
    input_points = get_temp_data(vector_key)
    record_progress(batch_id,ProgressRecord({"exec_name":"准备向量存储","doc_index":doc_index,"progress":85,"is_last":is_last}))
    # 将所有向量存储到向量数据库中
    store_document_vectors(input_points, qdrant)
    record_progress(
        batch_id,
        ProgressRecord({"exec_name":"向量化存储完毕", "doc_index":doc_index, "progress":100, "is_last":is_last}),
    )

@celery_app.task
@logger_handler("knowledge")
# 定义父任务
def manage_sub_tasks(batch_id:str, file_list:list[str]):
    print(f"start")
    # record_progress(batch_id,{"exec_name":"创建批量处理任务中","progress":10})
    print(f"record_progress")
    for i,file in enumerate(file_list,1):
        pipeline = chain(
            sub_task_1.s(TaskInfo({"batch_id":batch_id,"doc_index":i,"source_url":file,"is_last":int(i==len(file_list))}),file),
            sub_task_2.s(),
            sub_task_3.s(),
            sub_task_4.s()
        )
        pipeline.apply_async()
    # record_progress(batch_id,{"exec_name":"执行批量处理任务中","progress":20})

@celery_app.task
@logger_handler("knowledge")
# 查询进度
def track_knowledge_save_progress(batch_id:str):
    redis_data = get_all_data(f"knowledge:progress:{batch_id}")
    
    transformed_data = {
        "exec_name":redis_data.get("exec_name",""),
        "doc_index":redis_data.get("doc_index","-"),
        "progress":float(redis_data.get("progress",0)),
        "is_last":int(redis_data.get("is_last",1))
    }
    return transformed_data


    

        

