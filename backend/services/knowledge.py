import asyncio
from typing import Annotated, List
import uuid
from fastapi import File, UploadFile
from infrastructure.queue.tasks.rag_tasks import (
    manage_sub_tasks,
    track_knowledge_save_progress,
)
from api.deps import OssClientDep
import alibabacloud_oss_v2 as oss
from settings import settings
from utils.snowflake_generate import snowflake_generate
from utils.datetime import gendatetime, totimestamp
from infrastructure.database.models.knowledge import Tag, knowledge_tag, Knowledge
from api.schemas.knowledge import (
    KnowledgeBaseMetaData,
    KnowledgeBaseSaveRequest,
    Chat,
    DocsRequest,
)
from api.deps import SessionDep, UserAuth
from capabilities.llm.factory import get_agent
from agents.text_extractor.state import AnswerWithJustification
from agents.text_extractor.prompts import SYSTEM_PROMPT
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from infrastructure.logging.logger import logger_handler, KnowledgeLogger
from datetime import datetime, timezone
from agents.knowledge_retrival.graph import compile_graph
import json
from sqlalchemy import select, text, func, desc, and_, distinct
from sqlalchemy.orm import selectinload, events
from datetime import datetime, timedelta, timezone


# 上传之后才能拿到远程文档链接 顺序返回和文件列表对应
# 拿到之后才能存入数据库关于source_url
# 单次文件上传
@logger_handler("knowledge")
async def upload_single_file(
    file_name: str, reader_data: bytes, oss_client: OssClientDep
):
    object_key = file_name
    result = await oss_client.put_object(
        oss.PutObjectRequest(
            bucket=settings.OSS_BUCKET, key=object_key, body=reader_data
        )
    )
    return f"https://{settings.OSS_BUCKET}.{settings.OSS_ENDPOINT}/{object_key}"


# 批量文件上传
@logger_handler("knowledge")
async def upload_batch_file(
    file_list: Annotated[List[UploadFile], File(...)], oss_client: OssClientDep
):
    semaphore = asyncio.Semaphore(10)

    async def semaphore_wrapper(
        file_name: str, reader_data: bytes, oss_client: OssClientDep
    ):
        async with semaphore:
            return await upload_single_file(file_name, reader_data, oss_client)

    tasks = []
    for file in file_list:
        file_content = await file.read()
        tasks.append(semaphore_wrapper(file.filename, file_content, oss_client))
    results = await asyncio.gather(*tasks)
    return results


# 保存原始知识库信息
@logger_handler("knowledge")
async def store_original_knowledge_metadata(
    metadata_list: List[KnowledgeBaseMetaData],
    file_list: List[str],
    user_id,
    db: SessionDep,
):
    # 构建插入数据
    knowledge_data_list = []
    tag_set = set()
    tag_data = {}
    insert_tags = []
    re_data = []
    for idx, metadata in enumerate(metadata_list, 0):
        random_id = await snowflake_generate.generate()
        knowledge_data = {
            "id": random_id,
            "title": metadata.title,
            "summary": metadata.summary,
            "source": metadata.source,
            "source_url": file_list[idx],
            "create_at": gendatetime(),
            "user_id": user_id,
        }
        knowledge_data_list.append(knowledge_data)
        tag_set.update(metadata.tags)
        # for tag in metadata.tags:
        #     if not tag in tag_data:
        #         tag_id = await snowflake_generate.generate()
        #         tag_data[tag] = {"id": tag_id, "tag_name": tag}
        #     re_data.append(
        #         {
        #             "knowledge_id": knowledge_data.get("id"),
        #             "tag_id": tag_data.get(tag, {}).get("id"),
        #         }
        #     )

    stmt = select(Tag).where(Tag.tag_name.in_(list(tag_set)))
    tags = (await db.scalars(stmt)).fetchall()
    # 找出Tab表已存的数据，并更新现有tag_data表
    for tag in tags:
        tag_data[tag.tag_name] = {"id": tag.id, "tag_name": tag.tag_name}
    new_tag_set = tag_set - set(tag_data.keys())
    for tag in new_tag_set:
        tag_id = await snowflake_generate.generate()
        tag_data[tag] = {"id": tag_id, "tag_name": tag}
        insert_tags.append(tag_data[tag])
    for idx, metadata in enumerate(metadata_list, 0):
        target_knowledge = knowledge_data_list[idx]
        knowledge_id = target_knowledge.get("id")
        for tag in metadata.tags:
            re_data.append(
                {
                    "knowledge_id": knowledge_id,
                    "tag_id": tag_data.get(tag, {}).get("id"),
                }
            )
    insert_knowledge_sql = """
            INSERT INTO knowledge (id,title,summary,source,source_url,create_at,user_id)
            VALUES(:id,:title,:summary,:source,:source_url,:create_at,:user_id)
        """
    insert_tag_sql = "INSERT INTO tag (id,tag_name) VALUES(:id,:tag_name)"
    insert_re_sql = (
        "INSERT INTO knowledge_tag (knowledge_id,tag_id) VALUES(:knowledge_id,:tag_id)"
    )
    await db.execute(text(insert_knowledge_sql), knowledge_data_list)
    if insert_tags:
        await db.execute(text(insert_tag_sql), insert_tags)
    await db.execute(text(insert_re_sql), re_data)
    await db.commit()

    # tasks = []

    # async def store(idx: int, metadata: KnowledgeBaseMetaData):
    #     random_id = await snowflake_generate.generate()
    #     knowledge = Knowledge(
    #         id=random_id,
    #         title=metadata.title,
    #         summary=metadata.summary,
    #         source=metadata.source,
    #         source_url=file_list[idx],
    #         tags=metadata.tags,
    #         create_at=datetime.now(timezone.utc),
    #         user_id=int(user_id),
    #     )
    #     db.add(knowledge)
    #     await db.commit()
    #     await db.refresh(knowledge)

    # for idx, metadata in enumerate(metadata_list, 0):
    #     tasks.append(store(idx, metadata))

    # await asyncio.gather(*tasks)


# 执行存储任务
@logger_handler("knowledge")
async def store_knowledge(
    knowledge_base: KnowledgeBaseSaveRequest,
    ua: UserAuth,
    db: SessionDep,
    oss_client: OssClientDep,
):
    batch_id = str(uuid.uuid4())
    # 上传文件到远程
    transformed_file_list = await upload_batch_file(
        knowledge_base.file_list, oss_client
    )

    # 合并拿到的文件url和原始meta信息
    await store_original_knowledge_metadata(
        knowledge_base.metadata_list, transformed_file_list, ua.id, db
    )
    # 执行存储任务
    result = manage_sub_tasks.delay(batch_id, transformed_file_list)
    return batch_id


# 查询进度
@logger_handler("knowledge")
def track_progress_service(batch_id: str):
    result = track_knowledge_save_progress.apply(args=(batch_id,))
    print(f"status>>{result.status}")
    if result.status != "FAILURE":
        return result.get()
    return False


# 文本提取
# 获取agent，要求按照既定格式返回
# 读取字节流再解码
@logger_handler("knowledge")
async def extract_text(file: Annotated[UploadFile, File(...)]):
    read_bytes = await file.read()
    text_content = read_bytes.decode("utf-8")
    agent = get_agent(
        "text_extractor",
        {"force_schema": True, "output_shcema": AnswerWithJustification},
    )
    result = agent.invoke(
        input=[SystemMessage(content=SYSTEM_PROMPT), HumanMessage(content=text_content)]
    )
    return result


# 根据tool调用信息总结
@logger_handler("knowledge")
async def rag_knowledge(chat: Chat):
    try:
        async for event in compile_graph.astream(
            input={
                "messages": [HumanMessage(content=chat.query)],
                "query": "",
                "vectors": [],
                "payload_list": [],
            },
            stream_mode="values",
        ):
            messages = event.get("messages")
            print(f"messages:{messages},{event}")
            if messages:
                current_message = messages[-1]
                if isinstance(current_message, AIMessage) and hasattr(
                    current_message, "content"
                ):
                    content = getattr(current_message, "content")
                    result = {"content": content}
                    yield f"data: {json.dumps(result,ensure_ascii=False)}\n\n"

    except Exception as e:
        KnowledgeLogger.error("rag knowledge error")
        # print(f"exception{str(e)}")
        error = {"content": str(e)}
        yield f"data: {json.dumps(error,ensure_ascii=False)}\n\n"


@logger_handler("knowledge")
async def get_hot_topics(topN: int, db: SessionDep):
    stmt = (
        select(Tag, func.count().label("tag_count"))
        .join(knowledge_tag, Tag.id == knowledge_tag.c.tag_id)
        .group_by(Tag.id)
        .order_by("tag_count", desc("tag_count"))
    )
    result = await db.execute(stmt)
    topics = [
        {"tag_id": r.Tag.id, "tag_name": r.Tag.tag_name, "count": r.tag_count}
        for r in result
    ]
    top_n = topN if topN else 10
    await db.commit()
    return topics[:top_n]


# 获取统计数据
# 包括文档总数、话题总数、本周新增，无需入参
@logger_handler("knowledge")
async def get_docs_stats(db: SessionDep):
    # 文档总数
    knowledge_count_stmt = select(func.count(knowledge_tag.c.knowledge_id))
    knowledge_total = await db.scalar(knowledge_count_stmt)

    # 话题总数
    tag_count_stmt = select(func.count(Tag.id))
    tag_total = await db.scalar(tag_count_stmt)

    # 本周新增
    weekly_knowledge_count_stmt = (
        select(func.count(knowledge_tag.c.knowledge_id))
        .join(Knowledge, Knowledge.id == knowledge_tag.c.knowledge_id)
        .where(
            and_(
                datetime.now(timezone.utc) - timedelta(weeks=1) <= Knowledge.create_at,
                Knowledge.create_at <= datetime.now(timezone.utc),
            )
        )
    )
    weekly_knowledge_total = await db.scalar(weekly_knowledge_count_stmt)
    await db.commit()
    return {
        "knowledge_total": knowledge_total,
        "weekly_knowledge_total": weekly_knowledge_total,
        "tag_total": tag_total,
    }


@logger_handler("knowledge")
async def get_docs(docs_request: DocsRequest, db: SessionDep):
    topic = docs_request.topic
    page_size = docs_request.page_size
    page_num = docs_request.page_num
    if topic:
        print(f"page_size:{page_size},page_num:{page_num}")
        knowledge_tag_stmt = (
            select(Tag, knowledge_tag.c.knowledge_id.label("knowledge_id"))
            .join(knowledge_tag, Tag.id == knowledge_tag.c.tag_id)
            .join(Knowledge, Knowledge.id == knowledge_tag.c.knowledge_id)
            .where(Tag.tag_name == topic)
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .order_by(Knowledge.id, desc(Knowledge.id))
        )
        knowledge_tag_result = await db.execute(knowledge_tag_stmt)
        knowledge_tag_map = {}
        for item in knowledge_tag_result:
            print(f"knowledge_id:{item.knowledge_id}")
            knowledge_tag_map[item.knowledge_id] = [
                *knowledge_tag_map.get(item.knowledge_id, []),
                {"id": item.Tag.id, "tag_name": item.Tag.tag_name},
            ]
        print(f"knowledgelist:{list(knowledge_tag_map.keys())}")
        knowledge_stmt = select(Knowledge).where(
            Knowledge.id.in_(list(knowledge_tag_map.keys()))
        )
        knowledge_result = (await db.scalars(knowledge_stmt)).fetchall()
        knowledge_list = [
            {
                "id": k.id,
                "title": k.title,
                "summary": k.summary,
                "source": k.source,
                "source_url": k.source_url,
                "create_at": totimestamp(k.create_at),
                "tags": knowledge_tag_map[k.id],
            }
            for k in knowledge_result
        ]

        knowledge_count_stmt = (
            select(func.count(distinct(knowledge_tag.c.knowledge_id)))
            .join(Tag, knowledge_tag.c.tag_id == Tag.id)
            .where(Tag.tag_name == topic)
        )
        total = await db.scalar(knowledge_count_stmt)
        await db.commit()
        result = {
            "topic": topic,
            "knowledge_list": knowledge_list,
            "total": total,
            "page_size": page_size,
            "page_num": page_num,
        }
        return result
    else:
        # 近一周文档数量
        knowledge_count_stmt = (
            select(func.count(distinct(knowledge_tag.c.knowledge_id)))
            .join(Knowledge, Knowledge.id == knowledge_tag.c.knowledge_id)
            .where(
                and_(
                    datetime.now(timezone.utc) - timedelta(weeks=1)
                    <= Knowledge.create_at,
                    Knowledge.create_at <= datetime.now(timezone.utc),
                )
            )
        )
        total = await db.scalar(knowledge_count_stmt)
        knowledge_stmt = (
            select(Knowledge)
            .options(selectinload(Knowledge.tags))
            .where(
                and_(
                    datetime.now(timezone.utc) - timedelta(weeks=1)
                    <= Knowledge.create_at,
                    Knowledge.create_at <= datetime.now(timezone.utc),
                )
            )
            .limit(page_size)
            .offset((page_num - 1) * page_size)
            .order_by(Knowledge.id, desc(Knowledge.id))
        )
        knowledge_result = (await db.scalars(knowledge_stmt)).fetchall()
        knowledge_list = [
            {
                "id": k.id,
                "title": k.title,
                "summary": k.summary,
                "source": k.source,
                "source_url": k.source_url,
                "create_at": totimestamp(k.create_at),
                "tags": k.tags,
            }
            for k in knowledge_result
        ]
        # knowledge_list = [
        #     KnowledgeBaseMetaData.model_validate(r) for r in knowledge_result
        # ]
        await db.commit()
        result = {
            "total": total,
            "knowledge_list": knowledge_list,
            "page_size": page_size,
            "page_num": page_num,
        }
        return result
