# 拦截每一次api的请求 记录请求路径、请求方法、请求入参、请求content-type
from starlette.middleware.base import BaseHTTPMiddleware
from infrastructure.logging.logger import RequestLogger
import time
from fastapi import Request,Response
from typing import Callable,Awaitable


class LoggerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self,request:Request,call_next:Callable[[Request], Awaitable[Response]]):
        RequestLogger.info(f"request url:{request.url.path},request method:{request.method},request ContentType:{request.headers.get('Content-Type')}")
        start_time = time.time()
        response = await call_next(request)
        end_time = time.time() 
        RequestLogger.info(f"response statuscode:{response.status_code},response time:{int((end_time-start_time)*1000)}ms")
        return response