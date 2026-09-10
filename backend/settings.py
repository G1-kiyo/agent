import os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv

# 加载.env 文件
# env_path = find_dotenv(filename=".env", raise_error_if_not_found=False)
# if env_path:
#     load_dotenv(dotenv_path=env_path)
#     print(f"Loaded .env file from {env_path}")
# else:
#     print(f".env file not found at {env_path}. Using system environment variables.")


class Settings:
    # 获取数据库配置
    DATABASE_USER = os.getenv("POSTGRES_USER")
    DATABASE_PASSWORD = os.getenv("POSTGRES_PASSWORD")
    DATABASE_DB = os.getenv("POSTGRES_DB")
    DATABASE_HOST = os.getenv("POSTGRES_HOST")

    # 获取环境配置
    ENVIRONMENT = os.getenv("ENVIRONMENT")

    # 获取认证密钥
    SECRET_KEY = os.getenv("SECRET_KEY")

    # 获取API KEY
    TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
    ZHIPU_API_KEY = os.getenv("ZHIPU_API_KEY")

    # 获取Qdrant配置
    QDRANT_HOST = os.getenv("QDRANT_HOST")
    QDRANT_PORT = os.getenv("QDRANT_PORT")

    # 获取Celery配置
    CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND")

    # 获取Redis通用配置
    REDIS_HOST = os.getenv("REDIS_HOST")
    REDIS_USER = os.getenv("REDIS_USER")
    REDIS_PORT = os.getenv("REDIS_PORT")
    REDIS_DB = os.getenv("REDIS_DB")
    CELERY_NEW_CONNECTION_POOL_DB = os.getenv("CELERY_NEW_CONNECTION_POOL_DB")

    # 获取OSS配置
    OSS_ACCESS_KEY_ID = os.getenv("OSS_ACCESS_KEY_ID")
    OSS_ACCESS_KEY_SECRET = os.getenv("OSS_ACCESS_KEY_SECRET")
    OSS_REGION = os.getenv("OSS_REGION")
    OSS_BUCKET = os.getenv("OSS_BUCKET")
    OSS_ENDPOINT = os.getenv("OSS_ENDPOINT")
    print(f"Loaded database>>>: {DATABASE_HOST}")

    @property
    def DATABASE_URL(self):
        return f"postgresql+asyncpg://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_HOST}/{self.DATABASE_DB}"

    @property
    def AI_CONNECTION_POOL(self):
        return f"postgresql://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_HOST}/{self.DATABASE_DB}"

    @property
    def ALEMBIC_DATABASE_URL(self):
        if self.IS_DEVELOPMENT:
            return f"postgresql+asyncpg://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@localhost:5432/{self.DATABASE_DB}"
        return f"postgresql+asyncpg://{self.DATABASE_USER}:{self.DATABASE_PASSWORD}@{self.DATABASE_HOST}/{self.DATABASE_DB}"

    @property
    def IS_DEVELOPMENT(self):
        return self.ENVIRONMENT == "development"

    @property
    def REDIS_URL(self):
        return f"{self.REDIS_HOST}://{self.REDIS_USER}:{self.REDIS_PORT}/{self.REDIS_DB}"


settings = Settings()
