from settings import settings
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from infrastructure.database.models.base import Base




# 获取当前环境
IS_DEVELOPMENT = settings.IS_DEVELOPMENT
# 获取databse_url
DATABASE_URL = settings.DATABASE_URL



# 创建数据库引擎
engine = create_async_engine(
    DATABASE_URL, pool_size=10, max_overflow=20, echo=IS_DEVELOPMENT
)

# 创建会话session
session = async_sessionmaker(engine, autocommit=False, autoflush=False)






async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
