from fastapi import APIRouter
from services.discussion import (
    create_new_discussion,
    get_categories,
    get_reactions,
    get_discussion_list,
    get_discussion_detail,
    get_messages,
    send_message,
    reply_message,
    react_message,
    generate_ai_debate,
    fork_new_discussion
)
from api.schemas.discussion import (
    DiscussionCreate,
    DiscussionListRequest,
    MessageRequest,
    SendMessageRequest,
    ReplyMessageRequest,
    ReactMessageRequest,
    ForkRequest
)
from api.deps import SessionDep,UserAuth
from api.schemas.base import BaseResponse
from typing import Optional

discussion_router = APIRouter()

@discussion_router.post("/discussion/create")
async def create(discussion_create:DiscussionCreate,ua:UserAuth,db:SessionDep):
    is_create_succ = await create_new_discussion(discussion_create,ua,db)
    if is_create_succ:
        return BaseResponse.success(data=None,msg="create new discussion successfully",)
    return BaseResponse.failure(data=None,msg="discussion title already existed",)


@discussion_router.get("/discussion/categories")
async def categories(ua:UserAuth,):
    category_list = await get_categories()
    return BaseResponse.success(data=category_list,msg="get categories successfully",)

@discussion_router.get("/discussion/reactions")
async def reactions(ua:UserAuth,):
    reaction_list = await get_reactions()
    return BaseResponse.success(data=reaction_list,msg="get reactions successfully",)

@discussion_router.post("/discussion/discussions")
async def discussions(discussion_list_request:DiscussionListRequest,ua:UserAuth,db:SessionDep):
    discussion_list = await get_discussion_list(discussion_list_request,db)
    return BaseResponse.success(data=discussion_list,msg="get discussion list successfully",)

@discussion_router.get("/discussion/detail")
async def detail(ua:UserAuth,db:SessionDep,discussion_id:Optional[int] = None):
    discussion_detail = await get_discussion_detail(discussion_id,db)
    return BaseResponse.success(data=discussion_detail,msg="get discussion detail successfully",)

@discussion_router.post("/discussion/messages")
async def messages(message_request:MessageRequest,ua:UserAuth,db:SessionDep):
    messages = await get_messages(message_request,ua,db)
    return BaseResponse.success(data=messages,msg="get messages successfully",)

@discussion_router.post("/discussion/send_message")
async def send(send_message_request:SendMessageRequest,ua:UserAuth,db:SessionDep):
    await send_message(send_message_request,ua,db)
    return BaseResponse.success(data=None,msg="send message successfully",)

@discussion_router.post("/discussion/reply_message")
async def reply(reply_message_request:ReplyMessageRequest,ua:UserAuth,db:SessionDep):
    await reply_message(reply_message_request,ua,db)
    return BaseResponse.success(data=None,msg="reply message successfully",)

@discussion_router.post("/discussion/react_message")
async def react(react_message_request:ReactMessageRequest,ua:UserAuth,db:SessionDep):
    await react_message(react_message_request,ua,db)
    return BaseResponse.success(data=None,msg="react message successfully",)

@discussion_router.get("/discussion/generate_ai_debate")
async def ai_debate(discussion_id:int,ua:UserAuth,db:SessionDep):
    ai_debate = await generate_ai_debate(discussion_id,db)
    return BaseResponse.success(data=ai_debate,msg="generate ai debate successfully",)

@discussion_router.post("/discussion/fork")
async def fork(fork_request:ForkRequest,ua:UserAuth,db:SessionDep):
    fork_discussion = await fork_new_discussion(fork_request,ua,db)
    if fork_discussion:
        return BaseResponse.success(data=fork_discussion,msg="fork discussion successfully",)
    return BaseResponse.failure(data=None,msg="discussion is invalid",)
    