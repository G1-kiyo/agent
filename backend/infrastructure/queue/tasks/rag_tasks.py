import json
from fastapi.encoders import jsonable_encoder
from typing import Optional
from celery import chain
from infrastructure.logging.logger import logger_handler, KnowledgeLogger
from celery_app import celery_app
from infrastructure.cache.redis_client import get_sync_redis
from capabilities.rag.embeddings import (
    load_documents_from_file,
    split_documents,
    generate_document_vectors,
)
from capabilities.rag.vector_store import store_document_vectors, get_qdrant
from infrastructure.database.session import get_session
from sqlalchemy import update, select, and_
from infrastructure.database.models.knowledge import Knowledge
from api.schemas.knowledge import KnowledgeStatus


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


class StoredFile(dict):
    id: int
    source_url: str


class ErrorFile(dict):
    title: str
    status: KnowledgeStatus


def record_progress(batch_id: str, record: ProgressRecord):
    r = get_sync_redis()
    r.hset(f"knowledge:progress:{batch_id}", mapping=record)


def store_knowledge(
    batch_id: str, knowledge_list: list[StoredFile], error_list: list[ErrorFile]
):
    print("celery task>>>")
    r = get_sync_redis()
    r.hset(
        f"knowledge:store:{batch_id}",
        mapping={
            "list": json.dumps(knowledge_list),
            "error_list": json.dumps(error_list),
        },
    )


def del_store_knowledge_field(batch_id: str, field: str):
    r = get_sync_redis()
    r.hdel(f"knowledge:store:{batch_id}", field)


def save_temp_data(key, val):
    r = get_sync_redis()
    r.hset(key, mapping={"list": json.dumps(val)})


def get_temp_data(key):
    r = get_sync_redis()
    stored = r.hget(key, "list")
    return json.loads(stored)


def get_all_data(key):
    r = get_sync_redis()
    stored = r.hgetall(key)
    return dict(stored)


@celery_app.task
@logger_handler("knowledge")
# 定义子任务1:加载原始文件
def sub_task_1(task_info: TaskInfo, file: str):
    batch_id = task_info.get("batch_id")
    doc_index = task_info.get("doc_index")
    is_last = task_info.get("is_last")
    # 准备加载
    record_progress(
        batch_id,
        ProgressRecord(
            {
                "exec_name": "准备加载原始文件",
                "doc_index": doc_index,
                "progress": 10,
                "is_last": is_last,
            }
        ),
    )
    documents = load_documents_from_file(file)
    # 拿到的是list[Document]
    # 转换一下转成存储里面的pagecontent
    chunked_document_list = []
    for doc in documents:
        content = doc.page_content
        source = doc.metadata.get("source", "")
        headings = doc.metadata.get("headings", "")
        if headings:
            headings = "章节:" + " < ".join(headings)
        chunked_document_list.append(
            {
                "content": content,
                "metadata": {
                    "source": source,
                    "headings": headings,
                    "doc_index": doc_index,
                },
            }
        )
    key = f"knowledge:docs:{batch_id}:{doc_index}"
    save_temp_data(key, chunked_document_list)
    # 加载完毕
    record_progress(
        batch_id,
        ProgressRecord(
            {
                "exec_name": "加载原始文件完毕",
                "doc_index": doc_index,
                "progress": 20,
                "is_last": is_last,
            }
        ),
    )
    return TaskResult({"key": key, "task_info": task_info})


@celery_app.task
@logger_handler("knowledge")
# 定义子任务2:分块
def sub_task_2(prev_task_result: TaskResult):
    doc_key = prev_task_result.get("key")
    task_info = prev_task_result.get("task_info")
    batch_id = task_info.get("batch_id")
    doc_index = task_info.get("doc_index")
    is_last = task_info.get("is_last")
    # 准备分块
    chunked_document_list = get_temp_data(doc_key)
    # doc列表，每个doc都产生对应的chunks列表
    record_progress(
        batch_id,
        ProgressRecord(
            {
                "exec_name": "准备文档分块",
                "doc_index": doc_index,
                "progress": 30,
                "is_last": is_last,
            }
        ),
    )
    splited_chunks = []
    for chunked_doc in chunked_document_list:
        chunks = split_documents(chunked_doc.get("content", ""))
        new_chunk_list = []
        for chunk in chunks:
            new_chunk_list.append(
                {"chunk": chunk, "metadata": chunked_doc.get("metadata", {})}
            )
        splited_chunks.extend(new_chunk_list)

    key = f"knowledge:chunks:{batch_id}:{doc_index}"
    save_temp_data(key, splited_chunks)
    # 加载完毕
    record_progress(
        batch_id,
        ProgressRecord(
            {
                "exec_name": "文档分块完毕",
                "doc_index": doc_index,
                "progress": 45,
                "is_last": is_last,
            }
        ),
    )
    return TaskResult({"key": key, "task_info": task_info})


@celery_app.task
@logger_handler("knowledge")
# 定义子任务3:内容向量化
def sub_task_3(prev_task_result: TaskResult):
    chunk_key = prev_task_result.get("key")
    task_info = prev_task_result.get("task_info")
    batch_id = task_info.get("batch_id")
    doc_index = task_info.get("doc_index")
    is_last = task_info.get("is_last")
    input_points = []
    # 准备向量化存储
    chunks = get_temp_data(chunk_key)
    record_progress(
        batch_id,
        ProgressRecord(
            {
                "exec_name": "准备向量转换",
                "doc_index": doc_index,
                "progress": 60,
                "is_last": is_last,
            }
        ),
    )
    for i, chunk in enumerate(chunks):
        vector = generate_document_vectors(chunk.get("chunk", ""))
        # print(f"vector>>:{vector}")
        input_points.append(
            {
                "vector": vector,
                "payload": {
                    **chunk.get("metadata", {}),
                    "chunk_index": i,
                    "content": chunk,
                },
            }
        )
    key = f"knowledge:vectors:{batch_id}:{doc_index}"
    save_temp_data(key, input_points)
    record_progress(
        batch_id,
        ProgressRecord(
            {
                "exec_name": "向量转换完毕",
                "doc_index": doc_index,
                "progress": 75,
                "is_last": is_last,
            }
        ),
    )
    return TaskResult({"key": key, "task_info": task_info})


@celery_app.task
@logger_handler("knowledge")
# 定义子任务4:向量存储
def sub_task_4(prev_task_result: TaskResult):
    qdrant = get_qdrant()
    session = get_session()
    vector_key = prev_task_result.get("key")
    task_info = prev_task_result.get("task_info")
    batch_id = task_info.get("batch_id")
    doc_index = task_info.get("doc_index")
    file_id = task_info.get("file_id")
    is_last = task_info.get("is_last")
    # 准备向量化存储
    input_points = get_temp_data(vector_key)
    record_progress(
        batch_id,
        ProgressRecord(
            {
                "exec_name": "准备向量存储",
                "doc_index": doc_index,
                "progress": 85,
                "is_last": is_last,
            }
        ),
    )
    # 将所有向量存储到向量数据库中
    store_document_vectors(input_points, qdrant)

    stmt = (
        update(Knowledge)
        .where(Knowledge.id == file_id)
        .values(status=KnowledgeStatus.DONE.value)
    )
    session.execute(stmt)
    session.commit()

    record_progress(
        batch_id,
        ProgressRecord(
            {
                "exec_name": "向量化存储完毕",
                "doc_index": doc_index,
                "progress": 100,
                "is_last": is_last,
            }
        ),
    )


@celery_app.task
@logger_handler("knowledge")
def handle_chain_task_error(request, exc, traceback, *args, **kwargs):
    KnowledgeLogger.error("chain task error")
    batch_id = args[0] if len(args) > 0 else None
    knowledge_ids = args[1] if len(args) > 1 else None
    session = get_session()
    # 更新数据库
    stmt = (
        update(Knowledge)
        .where(Knowledge.id.in_(knowledge_ids))
        .values(status=KnowledgeStatus.ERROR.value)
    )
    session.execute(stmt)
    session.commit()
    # 删除redis缓存字段
    del_store_knowledge_field(batch_id, "error_list")


@celery_app.task
@logger_handler("knowledge")
# 定义父任务
def manage_sub_tasks(batch_id: str, file_list: list[StoredFile]):
    try:
        store_knowledge(batch_id, file_list, [])
        for i, file in enumerate(file_list, 1):
            file_id = file.get("id", "")
            source_url = file.get("source_url", "")
            pipeline = chain(
                sub_task_1.s(
                    TaskInfo(
                        {
                            "batch_id": batch_id,
                            "doc_index": i,
                            "file_id": file_id,
                            "source_url": source_url,
                            "is_last": int(i == len(file_list)),
                        }
                    ),
                    source_url,
                ),
                sub_task_2.s(),
                sub_task_3.s(),
                sub_task_4.s(),
            ).on_error(handle_chain_task_error.s(batch_id, [file_id]))
            pipeline.apply_async()
        # record_progress(batch_id,{"exec_name":"执行批量处理任务中","progress":20})
    except Exception:
        print("error appear>>>")
        KnowledgeLogger.error("fail to start celery task")
        file_ids = [item.get("id", "") for item in file_list]
        handle_chain_task_error.apply(
            args=(
                batch_id,
                file_ids,
            )
        )


@celery_app.task
@logger_handler("knowledge")
# 查询进度
def track_knowledge_save_progress(batch_id: str):

    redis_data = get_all_data(f"knowledge:progress:{batch_id}")
    transformed_data = {
        "exec_name": redis_data.get("exec_name", ""),
        "doc_index": redis_data.get("doc_index", "-"),
        "progress": float(redis_data.get("progress", 0)),
        "is_last": int(redis_data.get("is_last", 1)),
    }
    stored_data = get_all_data(f"knowledge:store:{batch_id}")
    error_list = json.loads(stored_data.get("error_list", "[]"))
    if error_list:
        transformed_data["error_list"] = error_list
    else:
        knowledge_list = json.loads(stored_data.get("list", []))
        ids = [item.get("id", "") for item in knowledge_list]
        session = get_session()
        stmt = select(Knowledge.title, Knowledge.status).where(
            and_(Knowledge.id.in_(ids), Knowledge.status == KnowledgeStatus.ERROR.value)
        )
        result = session.execute(stmt).fetchall()
        jsonable_result = jsonable_encoder([dict(r._mapping) for r in result])
        if result:
            store_knowledge(batch_id, knowledge_list, jsonable_result)
            transformed_data["error_list"] = jsonable_result

    return transformed_data
