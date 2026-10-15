from celery import Celery
from celery.signals import worker_process_init
from infrastructure.database.session import init_sync_db

celery_app = Celery(__name__)
celery_app.config_from_object("infrastructure.queue.celery_config")
celery_app.autodiscover_tasks(["infrastructure.queue.tasks.rag_tasks"])

# _redis_pool = None


@worker_process_init.connect
def init_sync_database(**kwargs):
    init_sync_db()


# # 获取连接池
# def get_redis():
#     global _redis_pool
#     if _redis_pool is None:
#         init_connection_pool()
#     return redis.Redis(connection_pool=_redis_pool)
