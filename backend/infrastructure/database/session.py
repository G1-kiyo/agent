from settings import settings
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from infrastructure.database.models.base import Base


# 获取当前环境
IS_DEVELOPMENT = settings.IS_DEVELOPMENT
# 获取databse_url
DATABASE_URL = settings.DATABASE_URL
# 获取sync databse_url
SYNC_DATABASE_URL = settings.SYNC_DATABASE_URL


# 创建数据库引擎
engine = create_async_engine(
    DATABASE_URL, pool_size=10, max_overflow=20, echo=IS_DEVELOPMENT
)

# 创建会话session
session = async_sessionmaker(engine, autocommit=False, autoflush=False)

sync_engine = None
sync_session = None


# 创建同步数据库引擎
def init_sync_db():
    global sync_engine, sync_session
    sync_engine = create_engine(
        SYNC_DATABASE_URL, pool_size=10, max_overflow=20, echo=IS_DEVELOPMENT
    )
    sync_session = sessionmaker(sync_engine, autoflush=False)


# 获取同步session
def get_session():
    if sync_engine is None:
        init_sync_db()
    return sync_session()


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
