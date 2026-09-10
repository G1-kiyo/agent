from celery import Celery
from celery.signals import worker_process_init
import redis
from settings import settings

celery_app = Celery(__name__)
celery_app.config_from_object("infrastructure.queue.celery_config")
celery_app.autodiscover_tasks(["infrastructure.queue.tasks.rag_tasks"])

# _redis_pool = None


# @worker_process_init.connect
# def init_connection_pool(**kwargs):
#     global _redis_pool
#     broker_url = celery_app.conf.get("broker_url")

#     _redis_pool = redis.ConnectionPool.from_url(
#         broker_url,
#         db=settings.CELERY_NEW_CONNECTION_POOL_DB,
#         max_connections=10,
#         decode_responses=True,
#     )
 

# # 获取连接池
# def get_redis():
#     global _redis_pool
#     if _redis_pool is None:
#         init_connection_pool()
#     return redis.Redis(connection_pool=_redis_pool)
