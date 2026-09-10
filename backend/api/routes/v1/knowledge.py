from fastapi import APIRouter,UploadFile,File,Form
from api.schemas.knowledge import KnowledgeBaseMetaData,KnowledgeBaseSaveRequest,Chat,DocsRequest
from services.knowledge import (
    store_knowledge,
    track_progress_service,
    extract_text,
    rag_knowledge,
    get_hot_topics,
    get_docs,
    get_docs_stats
)
from api.deps import SessionDep,OssClientDep,UserAuth
from typing import Annotated,List,Optional
from fastapi.responses import StreamingResponse
import json
from api.schemas.base import BaseResponse
from api.schemas.user import User

knowledge_router = APIRouter()

# 后台启动保存知识库进程，并返回taskid
@knowledge_router.post("/knowledge/save_to_knowledge_base")
async def save_to_knowledge_base(
    file_list:Annotated[List[UploadFile],File(...)],
    metadata_list:Annotated[List[str],Form(...)],
    ua:UserAuth,
    db:SessionDep,
    oss_client:OssClientDep,
):
    transformed_metadata_list = []
    for metadata in metadata_list:
        json_data = json.loads(metadata)
        transformed_metadata_list.append(json_data)
    knowledge_base = KnowledgeBaseSaveRequest( 
        file_list=file_list, metadata_list=transformed_metadata_list
    )
    batch_id = await store_knowledge(knowledge_base, ua, db, oss_client)

    # Implement the logic to save to the knowledge base
    return BaseResponse.success(data={"batch_id": batch_id},msg="start saving to knowledge base",)

# 根据taskid查询进度
@knowledge_router.get("/knowledge/progress")
def track_progress(batch_id:str,ua:UserAuth):
    print("start")
    progress_res = track_progress_service(batch_id)
    print(f"progress_res>>{progress_res}")
    if not progress_res:
        return BaseResponse.failure(data=None,msg="track progress error")
    return BaseResponse.success(data=progress_res,msg="progress recorded successfully",)

# AI提取文本
# 单份文件处理，入参是文件
@knowledge_router.post("/knowledge/ai_extract_text")
async def extract_text_with_AI(file: Annotated[UploadFile, File(...)],ua:UserAuth):
    extracted_text = await extract_text(file)
    return BaseResponse.success(data=extracted_text,msg="AI extract text successfully",)

# rag检索
@knowledge_router.post("/knowledge/rag")
async def rag(chat:Chat,ua:UserAuth):
    return StreamingResponse(
        rag_knowledge(chat),
        media_type="text/event-stream"
    )

# 热门话题查询
@knowledge_router.get("/knowledge/hot_topics")
async def hot_topics(ua:UserAuth,db:SessionDep,topN:Optional[int]=None):
    topics = await get_hot_topics(topN,db)
    return BaseResponse.success(data=topics,msg="get hot topics successfully",)
# 查询知识库统计信息
@knowledge_router.get("/knowledge/stats")
async def stats(ua:UserAuth,db:SessionDep):
    stats = await get_docs_stats(db)
    return BaseResponse.success(data=stats,msg="get docs successfully",)
# 查询文档列表
@knowledge_router.post("/knowledge/docs")
async def docs(docs_request:DocsRequest,ua:UserAuth,db:SessionDep):
    docs = await get_docs(docs_request,db)
    return BaseResponse.success(data=docs,msg="get docs successfully",)