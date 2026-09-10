from redis import ConnectionPool,Redis
from redis.asyncio import ConnectionPool as AsyncConnectionPool,Redis as AsyncRedis
from settings import settings
from fastapi import FastAPI


common_config = {
    "url": settings.REDIS_URL,
    "max_connections":10,
    "decode_responses":True
}

_sync_connection_pool = ConnectionPool.from_url(**common_config)

_async_connection_pool = AsyncConnectionPool.from_url(**common_config)

def get_sync_redis():
    return Redis(connection_pool=_sync_connection_pool)


async def start_async_redis():
    redis_client = AsyncRedis(connection_pool=_async_connection_pool)
    await redis_client.__aenter__()

    return redis_client

async def stop_async_redis(redis_client:AsyncRedis):
    if redis_client:
        await redis_client.__aexit__(None,None,None)



