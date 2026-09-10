from fastapi import HTTPException, status, Depends, Request, WebSocket
from typing import Annotated, Union
from jwt import ExpiredSignatureError, InvalidTokenError
import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from api.schemas.user import User
from infrastructure.database.session import session
from infrastructure.database.models.user import User as UserModel
from services.auth import ALGORITHM, SECRET_KEY
from fastapi.security import OAuth2PasswordBearer
from alibabacloud_oss_v2.aio import AsyncClient
from aiokafka import AIOKafkaConsumer
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from redis.asyncio import Redis as AsyncRedis
from fastapi.exceptions import WebSocketException
import json
from utils.websocket_conn_manager import WebSocketConnManager
from utils.datetime import sec_to_milsec


# 声明简化
# 数据库依赖
# 创建会话获取函数，for依赖注入
async def get_session():
    # 管理async上下文，路由函数结束后自动关闭db连接
    async with session() as db:
        yield db


SessionDep = Annotated[AsyncSession, Depends(get_session)]

# 认证依赖
# 这个告诉 FastAPI：Token 从 Authorization: Bearer <token> 中提取
# tokenUrl指向api请求的相对路径，
oauth2_schema = OAuth2PasswordBearer(tokenUrl="login")
AuthToken = Annotated[str, Depends(oauth2_schema)]


# 通用 鉴权
async def authentication(token: str, credentials_exception: Exception, db: SessionDep):

    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    token_type = payload.get("type")
    if token_type != "access":
        raise credentials_exception
    user = payload.get("sub")
    exp = sec_to_milsec(payload.get("exp"))
    # 看是否有携带用户信息
    if user is None:
        raise credentials_exception
    # 判断用户是否真实有效
    stmt = select(UserModel).where((UserModel.id == int(user)))
    result = await db.scalars(stmt)
    target_user = result.first()
    if not target_user:
        raise credentials_exception
    valid_user = User.model_validate(target_user)
    return valid_user, exp


# Token认证
async def get_current_user(token: AuthToken, db: SessionDep):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": 'Bearer error="invalid_token"'},
    )
    expire_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token has expired",
        headers={"WWW-Authenticate": 'Bearer error="expired_token"'},
    )
    # 从token解析用户信息
    try:
        valid_user, exp = await authentication(token, credentials_exception, db)
        return valid_user
    except InvalidTokenError:
        raise credentials_exception
    except ExpiredSignatureError:
        raise expire_exception


UserAuth = Annotated[User, Depends(get_current_user)]


# websocket连接器注入
async def get_conn_manager_for_websocket(conn: WebSocket):
    return conn.app.state.websocket_conn_manager


WebSocketConnManagerDep = Annotated[
    WebSocketConnManager, Depends(get_conn_manager_for_websocket)
]


async def websocket_authentication(
    token: str,
    websocket: WebSocket,
    db: SessionDep,
    wcm: WebSocketConnManagerDep,
    credentials_exception: Exception = WebSocketException(
        code=status.WS_1008_POLICY_VIOLATION, reason="Could not validate credentials"
    ),
):
    print(f"authentication start")
    if token:
        valid_user, exp = await authentication(token, credentials_exception, db)
        validate_content = {
            "event": "validatetoken",
            "payload": {"token": token, "expired_at": exp, "user": str(valid_user.id)},
        }
        print(f"validate_content:{validate_content}")
        await websocket.send_text(json.dumps(validate_content))
        wcm.connect(valid_user.id, websocket)
        return valid_user
    else:
        raise credentials_exception


# Token认证
async def get_current_user_websocket(
    websocket: WebSocket, db: SessionDep, wcm: WebSocketConnManagerDep
):
    credentials_exception = WebSocketException(
        code=status.WS_1008_POLICY_VIOLATION, reason="Could not validate credentials"
    )
    expire_exception = WebSocketException(
        code=status.WS_1008_POLICY_VIOLATION, reason="Token has expired"
    )
    print(f"websocket connection already ok")
    # 从token解析用户信息
    await websocket.accept()
    try:
        msg = await websocket.receive_text()
        print(f"get_user_info:{msg}")
        j_msg = json.loads(msg) if msg else {}
        token = j_msg.get("payload", {}).get("token", None)
        user = await websocket_authentication(token,websocket,db,wcm)
        return user
    except InvalidTokenError:
        raise credentials_exception
    except ExpiredSignatureError:
        raise expire_exception


WebsocketUserAuth = Annotated[User, Depends(get_current_user_websocket)]

# qdrant依赖注入
# def get_qdrant_client(request: Request):
#     return request.app.state.qdrant_client
# QdrantClientDep = Annotated[QdrantClient, Depends(get_qdrant_client)]


# ossclient依赖注入
def get_oss_client(conn: Request):
    return conn.app.state.oss_client


OssClientDep = Annotated[AsyncClient, Depends(get_oss_client)]


# kafka依赖注入
def get_kafka_consumer(conn: WebSocket):
    return conn.app.state.kafka_consumer


KafkaConsumer = Annotated[AIOKafkaConsumer, Depends(get_kafka_consumer)]


# saver注入
async def get_ai_saver(conn: Request):
    return conn.app.state.ai_saver


SaverDep = Annotated[AsyncPostgresSaver, Depends(get_ai_saver)]


# redis注入
async def get_redis_client(conn: Request):
    return conn.app.state.redis_client


RedisClient = Annotated[AsyncRedis, Depends(get_redis_client)]


# redis注入
async def get_redis_client_for_websocket(conn: WebSocket):
    return conn.app.state.redis_client


WebSocketRedisClient = Annotated[AsyncRedis, Depends(get_redis_client_for_websocket)]
