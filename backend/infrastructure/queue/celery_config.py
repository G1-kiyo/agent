from settings import settings


# broker url和result backend 配置
broker_url = settings.CELERY_BROKER_URL
result_backend = settings.CELERY_RESULT_BACKEND

# 序列化配置
# 客户端调用task-->（python对象）-->task_serializer序列化-->（字符串或字节流）-->消息代理broker原样传输-->worker 反序列化-->（python对象）-->执行任务-->把执行结果打包序列化-->存储到backend
# 决定发送方如何打包入参、任务
task_serializer = "json"
# 决定worker如何打包执行结果
result_serializer = "json"
# 决定worker和客户端允许接收哪些格式的信息
accept_content = ["json"]

# 时区
timezone = "Asia/Shanghai" 
enable_utc = True

# 结果过期时间
result_expires = 24*3600  # 1 hour


