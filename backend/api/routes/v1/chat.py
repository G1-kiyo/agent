from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from api.schemas.chat import Chat
from services.chat import search
from api.deps import UserAuth,SaverDep

chat_router = APIRouter()
# 咨询最新ai资讯
@chat_router.post("/news/search")
async def search_ai_news(chat:Chat,ua:UserAuth,saver:SaverDep):
    return StreamingResponse(
        search(chat,saver),
        media_type="text/event-stream"
    )
