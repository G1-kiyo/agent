from infrastructure.logging.logger import ExceptionLogger, logger_handler
from api.deps import SessionDep, UserAuth, KafkaConsumer, WebSocketRedisClient
from api.schemas.discussion import (
    DiscussionCreate,
    DiscussionCategory,
    MessageReaction,
    Category,
    Reaction as ReactionModel,
    OperateType,
    DiscussionListRequest,
    Sort,
    MessageRequest,
    SendMessageRequest,
    ReplyMessageRequest,
    ReactMessageRequest,
    ForkRequest,
    ForkType,
)
from api.schemas.user import User as UserModel
from sqlalchemy.exc import IntegrityError
from infrastructure.database.models.discussion import (
    Discussion,
    Message,
    Reply,
    Reaction,
)
from infrastructure.database.models.user import User
from utils.snowflake_generate import snowflake_generate
from utils.datetime import totimestamp, gendatetime, checkisinrange
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, func, desc, case, delete
from fastapi import WebSocket, status
import json
import asyncio
from langchain_core.messages import HumanMessage, SystemMessage
from agents.ai_debater.graph import compile_graph
from capabilities.llm.factory import get_agent
from agents.text_extractor.state import DiscussionSchema
from agents.text_extractor.prompts import DISCUSSION_SYSTEM_PROMPT


@logger_handler("discussion")
async def create_new_discussion(
    discussion_create: DiscussionCreate, ua: UserAuth, db: SessionDep
):
    try:
        discussion_id = await snowflake_generate.generate()
        discussion = Discussion(
            id=discussion_id,
            title=discussion_create.title,
            category=discussion_create.category,
            desc=discussion_create.desc,
            create_at=gendatetime(),
            user_id=ua.id,
        )
        db.add(discussion)
        await db.commit()
        await db.refresh(discussion)
        return {
            "id": str(discussion.id),
            "title": discussion.title,
            "category": discussion.category,
            "desc": discussion.desc,
            "create_at": totimestamp(discussion.create_at),
            "user_id": str(discussion.user_id),
        }
    except IntegrityError as e:
        origin_error = e.orig
        if origin_error.sqlstate == "23505":
            return False
        # 其他情况直接raise由全局捕获
        raise


@logger_handler("discussion")
async def get_categories():
    category_list = [
        DiscussionCategory(
            id=Category.TECHNOLOGY.value, name=Category.TECHNOLOGY.label
        ),
        DiscussionCategory(id=Category.PRODUCT.value, name=Category.PRODUCT.label),
        DiscussionCategory(id=Category.DESIGN.value, name=Category.DESIGN.label),
        DiscussionCategory(id=Category.TEAM.value, name=Category.TEAM.label),
        DiscussionCategory(id=Category.OTHER.value, name=Category.OTHER.label),
    ]
    return category_list


@logger_handler("discussion")
async def get_reactions():
    reaction_list = [
        MessageReaction(
            type=ReactionModel.GOOD.value, content=ReactionModel.GOOD.label
        ),
        MessageReaction(type=ReactionModel.BAD.value, content=ReactionModel.BAD.label),
        MessageReaction(
            type=ReactionModel.SMILE.value, content=ReactionModel.SMILE.label
        ),
        MessageReaction(
            type=ReactionModel.PARTY.value, content=ReactionModel.PARTY.label
        ),
        MessageReaction(
            type=ReactionModel.UNHAPPY.value, content=ReactionModel.UNHAPPY.label
        ),
        MessageReaction(
            type=ReactionModel.HEART.value, content=ReactionModel.HEART.label
        ),
        MessageReaction(
            type=ReactionModel.ROCKET.value, content=ReactionModel.ROCKET.label
        ),
        MessageReaction(type=ReactionModel.EYE.value, content=ReactionModel.EYE.label),
    ]
    return reaction_list


@logger_handler("discussion")
async def get_discussion_list(
    discussion_list_request: DiscussionListRequest, db: SessionDep
):
    sortby = discussion_list_request.sortby
    category = discussion_list_request.category
    page_size = getattr(discussion_list_request, "page_size", 10)
    page_num = discussion_list_request.page_num
    search_title = discussion_list_request.search_title

    total_stmt = select(func.count(Discussion.id))
    discussion_create_stmt = (
        select(func.max(Discussion.create_at))
        .where(Discussion.id == Discussion.id)
        .correlate(Discussion)
        .scalar_subquery()
    )
    message_create_stmt = (
        select(func.max(Message.create_at))
        .where(Message.discussion_id == Discussion.id)
        .correlate(Discussion)
        .scalar_subquery()
    )
    reply_create_stmt = (
        select(func.max(Reply.create_at))
        .where(Reply.discussion_id == Discussion.id)
        .correlate(Discussion)
        .scalar_subquery()
    )
    reaction_create_stmt = (
        select(func.max(Reaction.create_at))
        .where(Reaction.discussion_id == Discussion.id)
        .correlate(Discussion)
        .scalar_subquery()
    )
    common_stmt = func.greatest(
        func.coalesce(
            discussion_create_stmt, datetime(1970, 1, 1, tzinfo=timezone.utc)
        ),
        func.coalesce(message_create_stmt, datetime(1970, 1, 1, tzinfo=timezone.utc)),
        func.coalesce(reply_create_stmt, datetime(1970, 1, 1, tzinfo=timezone.utc)),
        func.coalesce(reaction_create_stmt, datetime(1970, 1, 1, tzinfo=timezone.utc)),
    ).label("last_activity")
    # common_stmt = text("""
    #         GREATEST(
    #                 COALESCE((SELECT MAX(message.create_at) FROM message),'1970-01-01'),
    #                 COALESCE((SELECT MAX(reply.create_at) FROM reply),'1970-01-01'),
    #                 COALESCE((SELECT MAX(reaction.create_at) FROM reaction),'1970-01-01')
    #             ) AS last_activity
    # """)
    discussion_stmt = None
    filter_stmt = None
    if sortby == Sort.LAST_ACTIVITY:
        discussion_stmt = (
            select(Discussion, common_stmt)
            .order_by(desc("last_activity"))
            .group_by(Discussion.id)
        )

    elif sortby == Sort.MESSAGE_NUM:
        discussion_stmt = (
            select(
                Discussion, common_stmt, func.count(Message.id).label("message_count")
            )
            .outerjoin(Message, Discussion.id == Message.discussion_id)
            .group_by(Discussion.id)
            .order_by(desc("message_count"))
        )

    else:
        discussion_stmt = (
            select(Discussion, common_stmt)
            .order_by(desc(Discussion.id))
            .group_by(Discussion.id)
        )

    if category.value:
        discussion_stmt = discussion_stmt.where(Discussion.category == category)
        filter_stmt = total_stmt.where(Discussion.category == category)

    if search_title:
        discussion_stmt = discussion_stmt.where(
            Discussion.title.like(f"%{search_title}%")
        )
        filter_stmt = total_stmt.where(Discussion.title.like(f"%{search_title}%"))

    discussion_stmt = discussion_stmt.limit(page_size).offset(
        (page_num - 1) * page_size
    )

    discussion_result = (await db.execute(discussion_stmt)).fetchall()
    first_result = (await db.execute(discussion_stmt)).first()
    print(f"first_result: {first_result},{first_result._fields}")
    total = await db.scalar(total_stmt)
    filter_num = (
        (await db.scalar(filter_stmt)) if (category.value or search_title) else total
    )
    discussion_list = [
        {
            "id": str(r.Discussion.id),
            "title": r.Discussion.title,
            "create_at": totimestamp(r.Discussion.create_at),
            "is_active": checkisinrange(r.last_activity, timedelta(days=30)),
            "last_activity": totimestamp(r.last_activity),
            "category": Category(r.Discussion.category).label,
        }
        for r in discussion_result
    ]
    return {
        "discussion_list": discussion_list,
        "page_size": page_size,
        "page_num": page_num,
        "total": total,
        "filter_num": filter_num,
    }


@logger_handler("discussion")
async def get_discussion_detail(discussion_id: int, db: SessionDep):
    if discussion_id is None:
        stmt = select(Discussion.id).order_by(desc(Discussion.id))
        discussion_id = await db.scalar(stmt)
        print(
            f"get_discussion_detail: discussion_id is None, get the latest discussion_id: {discussion_id}"
        )
        if discussion_id is None:
            return None

    discussion_stmt = (
        select(Discussion, User.username)
        .join(User, Discussion.user_id == User.id)
        .where(Discussion.id == discussion_id)
    )
    discussion_result = (await db.execute(discussion_stmt)).fetchone()
    if discussion_result is None:
        return None
    discussion = {
        "discussion_id": str(discussion_result.Discussion.id),
        "title": discussion_result.Discussion.title,
        "category": discussion_result.Discussion.category,
        "desc": discussion_result.Discussion.desc,
        "create_at": totimestamp(discussion_result.Discussion.create_at),
        "user_id": str(discussion_result.Discussion.user_id),
        "username": discussion_result.username,
    }
    print(f"discussion_result: {discussion_result},{discussion_result._fields}")

    message_stmt = (
        select(
            Message.id.label("message_id"),
            Message.create_at,
            User.username,
            User.id.label("user_id"),
        )
        .join(User, Message.user_id == User.id)
        .where(Message.discussion_id == discussion_id)
        .order_by(desc(Message.id))
    )
    message_result = (await db.execute(message_stmt)).fetchall()
    message_count_stmt = select(func.count(Message.id).label("message_count")).where(
        Message.discussion_id == discussion_id
    )
    message_count = await db.scalar(message_count_stmt)
    user_map = {
        discussion_result.Discussion.user_id: {
            "user_id": discussion["user_id"],
            "username": discussion["username"],
        }
    }
    message_id_set = set()
    creattime_list = [discussion_result.Discussion.create_at]
    for idx, r in enumerate(message_result):
        message_id_set.add(r.message_id)
        if idx == 0:
            creattime_list.append(r.create_at)
        if r.user_id not in user_map:
            user_map[r.user_id] = {"user_id": r.user_id, "username": r.username}

    reply_stmt = (
        select(
            Reply.id.label("reply_id"),
            Reply.create_at,
            User.username,
            User.id.label("user_id"),
        )
        .join(User, Reply.user_id == User.id)
        .where(Reply.message_id.in_(list(message_id_set)))
        .order_by(desc(Reply.id))
    )
    reply_result = (await db.execute(reply_stmt)).fetchall()
    reply_count_stmt = select(func.count(Reply.id).label("reply_count")).where(
        Reply.discussion_id == discussion_id
    )
    reply_count = await db.scalar(reply_count_stmt)
    reaction_stmt = (
        select(Reaction.create_at, User.username, User.id.label("user_id"))
        .join(User, Reaction.user_id == User.id)
        .where(Reaction.message_id.in_(list(message_id_set)))
        .order_by(desc(Reaction.id))
    )
    reaction_result = (await db.execute(reaction_stmt)).fetchall()

    for idx, r in enumerate(reply_result):
        if idx == 0:
            creattime_list.append(r.create_at)
        if r.user_id not in user_map:
            user_map[r.user_id] = {"user_id": r.user_id, "username": r.username}

    for idx, r in enumerate(reaction_result):
        if idx == 0:
            creattime_list.append(r.create_at)
        if r.user_id not in user_map:
            user_map[r.user_id] = {"user_id": r.user_id, "username": r.username}

    participant_count = len(user_map)
    participant_list = list(user_map.values())

    last_activity = max(creattime_list)
    is_active = checkisinrange(last_activity, timedelta(days=30))

    return {
        **discussion,
        "is_active": is_active,
        "last_activity": last_activity,
        "participant_count": participant_count,
        "participant_list": participant_list,
        "message_count": message_count,
        "reply_count": reply_count,
    }


@logger_handler("discussion")
async def get_discussion_basicinfo(discussion_id: int, db: SessionDep):
    discussion_stmt = (
        select(Discussion, User.username)
        .join(User, Discussion.user_id == User.id)
        .where(Discussion.id == discussion_id)
    )
    discussion_result = (await db.execute(discussion_stmt)).fetchone()
    discussion = {
        "discussion_id": str(discussion_result.Discussion.id),
        "title": discussion_result.Discussion.title,
        "category": discussion_result.Discussion.category,
        "desc": discussion_result.Discussion.desc,
        "create_at": totimestamp(discussion_result.Discussion.create_at),
        "user_id": str(discussion_result.Discussion.user_id),
        "username": discussion_result.username,
    }
    return discussion


@logger_handler("discussion")
async def generate_ai_debate(discussion_id: int, db: SessionDep):
    discussion_basicinfo = await get_discussion_basicinfo(discussion_id, db)
    if discussion_basicinfo:
        category = discussion_basicinfo["category"]
        discussion_str = f"""
            当前话题背景信息如下：\n
            话题标题：{discussion_basicinfo["title"]}\n
            话题分类：{Category.to_chinesename(category)}\n
            话题描述：{discussion_basicinfo["desc"]}
        """
        result = await compile_graph.ainvoke(
            input={
                "messages": [HumanMessage(content=discussion_str)],
                "classifications": [],
                "opinions": [],
                "summary": "",
            }
        )
        return {
            "opinions": result.get("opinions", []),
            "summary": result.get("summary", ""),
        }
    return None


@logger_handler("discussion")
async def fork_new_discussion(fork_request: ForkRequest, ua: UserAuth, db: SessionDep):
    discussion_id = fork_request.discussion_id
    content = fork_request.content
    llm = get_agent(
        "text_extractor", {"force_schema": True, "output_schema": DiscussionSchema}
    )
    llm_result = None
    created_discussion = {}
    if fork_request.type == ForkType.DISCUSSION:
        if discussion_id is None:
            return False
        discussion_basicinfo = await get_discussion_basicinfo(discussion_id, db)
        basicinfo_str = f"""
            话题原始背景信息：标题为{discussion_basicinfo["title"]},属于{discussion_basicinfo["category"]}类，
            主题是 {discussion_basicinfo["desc"]}\n
            现在要在该话题上进行分叉讨论，新的讨论信息是：{content}
        """
        llm_result = await llm.ainvoke(
            [
                HumanMessage(content=basicinfo_str),
                SystemMessage(content=DISCUSSION_SYSTEM_PROMPT),
            ]
        )

    else:
        basicinfo_str = f"""
            现在需要根据下述内容进行话题分叉：{content}
        """
        llm_result = await llm.ainvoke(
            [
                HumanMessage(content=basicinfo_str),
                SystemMessage(content=DISCUSSION_SYSTEM_PROMPT),
            ]
        )
    if llm_result.is_valid:
        created_discussion = await create_new_discussion(
            DiscussionCreate.model_validate(
                {
                    "title": llm_result.title,
                    "category": Category.to_code(llm_result.category.value),
                    "desc": llm_result.desc,
                }
            ),
            ua,
            db,
        )
        return created_discussion
    return False


@logger_handler("discussion")
async def get_messages(message_request: MessageRequest, ua: UserAuth, db: SessionDep):
    discussion_id = message_request.discussion_id
    page_size = message_request.page_size
    last_message_id = message_request.last_message_id
    message_stmt = (
        select(Message)
        .where(Message.discussion_id == discussion_id)
        .limit(page_size)
        .order_by(desc(Message.id))
    )
    if last_message_id:
        message_stmt = message_stmt.where(Message.id < int(last_message_id))
    message_result = (await db.scalars(message_stmt)).fetchall()
    message_map = {}
    for m in message_result:
        if m.id not in message_map:
            message_map[m.id] = {
                "discussion_id": str(m.discussion_id),
                "message_id": str(m.id),
                "content": m.content,
                "create_at": totimestamp(m.create_at),
                "username": "",
                "is_host": False,
                "replies": [],
                "reactions": [],
            }
    message_id_list = list(message_map.keys())
    reaction_stmt = select(Reaction).where(Reaction.message_id.in_(message_id_list))
    reaction_result = (await db.scalars(reaction_stmt)).fetchall()
    for r in reaction_result:
        target_message = message_map.get(r.message_id, None)
        if target_message:
            target_message["reactions"].append(
                {
                    "reaction_id": str(r.id),
                    "type": r.type,
                    "content": r.content,
                    "user_id": str(r.user_id),
                }
            )
    reply_stmt = (
        select(Reply, User.username)
        .join(User, User.id == Reply.user_id)
        .where(Reply.message_id.in_(message_id_list))
        .order_by(desc(Reply.id))
    )
    reply_result = (await db.execute(reply_stmt)).fetchall()
    for r in reply_result:
        target_message = message_map.get(r.Reply.message_id, None)
        if target_message:
            target_message["replies"].append(
                {
                    "reply_id": str(r.Reply.id),
                    "username": r.username,
                    "create_at": totimestamp(r.Reply.create_at),
                    "content": r.Reply.content,
                }
            )

    user_stmt = (
        select(
            User.username,
            Message.id.label("message_id"),
            case((Message.user_id == Discussion.user_id, True), else_=False).label(
                "is_host"
            ),
        )
        .join(User, User.id == Message.user_id)
        .join(Discussion, Discussion.id == Message.discussion_id)
        .where(Message.id.in_(message_id_list))
    )
    user_result = (await db.execute(user_stmt)).fetchall()
    for u in user_result:
        target_message = message_map.get(u.message_id, None)
        if target_message:
            target_message["username"] = u.username
            target_message["is_host"] = u.is_host

    return {
        "current_user": {"user_id": str(ua.id), "username": ua.username},
        "messages": list(message_map.values()),
        "page_size": page_size,
        "last_message_id": str(message_id_list[-1]) if message_id_list else None,
    }


@logger_handler("discussion")
async def send_message(
    send_message_request: SendMessageRequest, ua: UserAuth, db: SessionDep
):
    message_id = await snowflake_generate.generate()
    message = Message(
        id=message_id,
        content=send_message_request.content,
        create_at=gendatetime(),
        user_id=ua.id,
        discussion_id=send_message_request.discussion_id,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)


@logger_handler("discussion")
async def reply_message(
    reply_message_request: ReplyMessageRequest, ua: UserAuth, db: SessionDep
):
    reply_id = await snowflake_generate.generate()
    reply = Reply(
        id=reply_id,
        content=reply_message_request.content,
        create_at=gendatetime(),
        user_id=ua.id,
        message_id=reply_message_request.message_id,
        discussion_id=reply_message_request.discussion_id,
    )
    db.add(reply)
    await db.commit()
    await db.refresh(reply)


@logger_handler("discussion")
async def react_message(
    react_message_request: ReactMessageRequest, ua: UserAuth, db: SessionDep
):
    operate_type = react_message_request.operate_type
    if operate_type == OperateType.CONFIRM:
        react_id = await snowflake_generate.generate()
        reaction = Reaction(
            id=react_id,
            type=react_message_request.type,
            content=react_message_request.content,
            create_at=gendatetime(),
            user_id=ua.id,
            message_id=react_message_request.message_id,
            discussion_id=react_message_request.discussion_id,
        )
        db.add(reaction)
        await db.commit()
        await db.refresh(reaction)

    else:
        reaction_stmt = (
            delete(Reaction)
            .where(Reaction.type == react_message_request.type)
            .where(Reaction.user_id == ua.id)
        )
        await db.execute(reaction_stmt)
        await db.commit()


@logger_handler("discussion")
async def notify_discussion(
    websocket: WebSocket, kas: KafkaConsumer, rd: WebSocketRedisClient, db: SessionDep
):
    try:
        while True:
            asyncio.sleep(5)
            print(f"notify status:{kas.__getstate__()}")

            table_list = ["message", "reply", "reaction"]
            batch_results = await kas.getmany(timeout_ms=10 * 1000)
            batch = []
            print(f"notify batch:{batch_results}")
            for messages in batch_results.values():
                for message in messages:
                    value = getattr(message, "value", None)
                    payload = value.get("payload", None) if value else None

                    if payload:
                        db = payload.get("source", {}).get("db")
                        table = payload.get("source", {}).get("table")
                        op = payload.get("op", "")
                        if db == "agent" and table in table_list:
                            if op == "c":
                                origin_data = payload.get("after", {})
                                user_id = origin_data.get("user_id", "")
                                user = await rd.hgetall(f"user:basicinfo:{user_id}")
                                common_data = {
                                    "content": origin_data.get("content", ""),
                                    "create_at": totimestamp(
                                        origin_data.get("create_at")
                                    ),
                                    "discussion_id": str(
                                        origin_data.get("discussion_id", "")
                                    ),
                                    "user_id": str(user_id),
                                }
                                if user:
                                    modify_data = {
                                        **common_data,
                                        "username": user.get("username", ""),
                                    }
                                else:
                                    user_stmt = select(User).where(User.id == user_id)
                                    user = await db.scalar(user_stmt)
                                    if user.username:
                                        modify_data = {
                                            **common_data,
                                            "username": user.username,
                                        }
                                        await rd.hset(
                                            f"user:basicinfo:{user_id}",
                                            mapping=UserModel.model_validate(
                                                user
                                            ).model_dump(),
                                        )

                                modify_data[f"{table}_id"] = str(
                                    origin_data.get("id", "")
                                )
                                if table != "message":
                                    modify_data["message_id"] = str(
                                        origin_data.get("message_id", "")
                                    )
                                if table == "reaction":
                                    modify_data["type"] = origin_data.get("type", "")
                                event = f"notifynew{table}"
                                result = {
                                    "event": event,
                                    "payload": modify_data,
                                }
                                batch.append(result)
                            elif table == "reaction" and op == "d":
                                modify_data = payload.get("before", {})

                                event = f"notifydelete{table}"
                                result = {
                                    "event": event,
                                    "payload": {
                                        "reaction_id": str(modify_data.get("id", ""))
                                    },
                                }
                                batch.append(result)

            if batch:
                await websocket.send_text(json.dumps(batch, ensure_ascii=False))
    except Exception as e:  # noqa: BLE001 - 兜底逻辑
        ExceptionLogger.error(
            msg=f"webspcket connection error-{e!s}",
            extra={"request_url": websocket.url},
        )
        error_code = status.WS_1011_INTERNAL_ERROR
        error_reason = str(e)
        error_msg = {
            "event": "reporterror",
            "payload": {"code": error_code, "reason": error_reason},
        }
        await websocket.send_text(json.dumps(error_msg))
        await websocket.close(code=error_code, reason=error_reason)
