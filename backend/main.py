from fastapi import FastAPI
from fastapi.exceptions import HTTPException,WebSocketException
from api.routes.v1.user import user_router
from api.routes.v1.chat import chat_router
from api.routes.v1.knowledge import knowledge_router
from api.routes.v1.discussion import discussion_router
from api.routes.websocket import websocket_router
from contextlib import asynccontextmanager
from utils.oss_client import start_oss_client,stop_oss_client
from utils.websocket_conn_manager import init_websocket_conn_manager
from infrastructure.kafka.consumer import start_kafka_consumer,stop_kafka_consumer
from capabilities.llm.storage import start_ai_connection_pool,stop_ai_connection_pool
from infrastructure.cache.redis_client import start_async_redis,stop_async_redis
from api.middleware import LoggerMiddleware
from api.exceptions import exception_handler,http_exception_handler,sql_exception_handler,websocket_exception_handler
from sqlalchemy.exc import IntegrityError


@asynccontextmanager
async def lifespan(app: FastAPI):
    # await init_db()
    oss_client = await start_oss_client()
    kafka_consumer = await start_kafka_consumer()
    ai_connection_pool,ai_saver = await start_ai_connection_pool()
    redis_client = await start_async_redis()

    app.state.oss_client = oss_client
    app.state.kafka_consumer = kafka_consumer
    app.state.ai_saver = ai_saver
    app.state.redis_client = redis_client
    
    init_websocket_conn_manager(app)
    yield

    await stop_oss_client(oss_client)
    await stop_kafka_consumer(kafka_consumer)
    await stop_ai_connection_pool(ai_connection_pool)
    await stop_async_redis(redis_client)

app = FastAPI(lifespan=lifespan,root_path="/api/v1")

# 添加中间件
app.add_middleware(LoggerMiddleware)

# 添加路由
app.include_router(user_router)
app.include_router(chat_router)
app.include_router(knowledge_router)
app.include_router(discussion_router)
app.include_router(websocket_router)
print(f"router>>{app.routes}")

# 添加异常处理
app.add_exception_handler(exc_class_or_status_code=IntegrityError,handler=sql_exception_handler)
app.add_exception_handler(exc_class_or_status_code=HTTPException,handler=http_exception_handler)
app.add_exception_handler(exc_class_or_status_code=Exception,handler=exception_handler)
app.add_exception_handler(exc_class_or_status_code=WebSocketException,handler=websocket_exception_handler)




@app.get("/health")
async def health():
    return {"status":"ok"}