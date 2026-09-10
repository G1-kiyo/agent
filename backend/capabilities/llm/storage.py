from psycopg_pool import AsyncConnectionPool
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from settings import settings
from psycopg.rows import dict_row
from fastapi import FastAPI

# 获取ai database_url
AI_CONNECTION_POOL = settings.AI_CONNECTION_POOL


async def start_ai_connection_pool():
    ai_connection_pool = AsyncConnectionPool(
        conninfo=AI_CONNECTION_POOL,
        min_size=2,
        max_size=10,
        kwargs={"autocommit": True, "row_factory": dict_row},
    )
    ai_connection_pool._open_implicit = False
    await ai_connection_pool.open()
    ai_saver = AsyncPostgresSaver(conn=ai_connection_pool)
    await ai_saver.setup()
    return ai_connection_pool,ai_saver

async def stop_ai_connection_pool(ai_connection_pool:AsyncConnectionPool):
    if ai_connection_pool:
        await ai_connection_pool.close()

