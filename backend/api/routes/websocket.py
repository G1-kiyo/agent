from fastapi import APIRouter, WebSocket, status, WebSocketDisconnect
from fastapi.exceptions import WebSocketException
from services.discussion import notify_discussion
from api.deps import (
    KafkaConsumer,
    WebSocketRedisClient,
    SessionDep,
    WebsocketUserAuth,
    WebSocketConnManagerDep,
    websocket_authentication
)
import json
from infrastructure.logging.logger import DiscussionLogger
import asyncio

websocket_router = APIRouter(prefix="/websocket")


@websocket_router.websocket("/discussion")
async def discussion_websocket_endpoint(
    websocket: WebSocket,
    ua: WebsocketUserAuth,
    kas: KafkaConsumer,
    rd: WebSocketRedisClient,
    db: SessionDep,
    wcm: WebSocketConnManagerDep,
):
    notify_task = None
    try:
        notify_task = asyncio.create_task(notify_discussion(websocket, kas, rd, db))
        while True:
            client_msg = await websocket.receive_text()
            j_client_msg = json.loads(client_msg)
            # 持续地验证token
            if j_client_msg.get("event",None) and j_client_msg.get("event") == "validatetoken":
                token = j_client_msg.get("payload",None).get("token")
                await websocket_authentication(token,websocket,db,wcm)
    except WebSocketDisconnect as disconnect:
        DiscussionLogger.info("websocket connection closed")
    except Exception as e:
        DiscussionLogger.error("outer discussion websocket error")
        wcm.disconnect(ua.id)
        raise WebSocketException(
            code=status.WS_1011_INTERNAL_ERROR,
            reason=getattr(e, "detail", "websocket internal error"),
        )
    finally:
        notify_task.cancel()
    
