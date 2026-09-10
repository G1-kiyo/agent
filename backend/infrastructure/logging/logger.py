# 日志配置
# 规定输出规范配置 时间 等级 信息
# 配置装饰器，作为基本日志上报，调用函数名称、入参、返回值 支持同步异步
# 提供人工手动上报快捷方式，规定格式 上报等级、业务场景类型、额外信息
import logging
import functools
import inspect
from typing import Mapping, TypedDict

logging.basicConfig(
    format="%(asctime)s %(levelname)s %(message)s", level=logging.INFO, encoding="utf-8"
)
logger = logging.getLogger(__name__)


def logger_handler(region: str):
    def decorator(func):
        if inspect.iscoroutinefunction(func):

            @functools.wraps(func)
            async def wrapper(*args, **kwargs):
                logger.info(
                    msg=f"{region}:async function {func.__name__} call start,input args:{args},kwargs:{kwargs}",
                )
                result = await func(*args, **kwargs)
                logger.info(
                    msg=f"{region}:async function {func.__name__} call end,return:{result}",
                )
                return result

            return wrapper
        else:

            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                logger.info(
                    msg=f"{region}:sync function {func.__name__} call start,input args:{args},kwargs:{kwargs}",
                )
                result = func(*args, **kwargs)
                logger.info(
                    msg=f"{region}:sync function {func.__name__} call end,return:{result}",
                )
                return result

            return wrapper

    return decorator


class BaseLogger:

    region: str = "api"

    @classmethod
    def info(cls, msg: str, extra: Mapping[str, object] | None = None):
        logger.info(msg=f"{cls.region} log:{msg}", extra=extra)

    @classmethod
    def error(cls, msg: str, extra: Mapping[str, object] | None = None):
        logger.error(msg=f"{cls.region} excption:{msg}", extra=extra, exc_info=True)


# 拦截上报
class RequestLogger(BaseLogger):

    region: str = "request_interceptor"


# 异常上报
class ExceptionLogger(BaseLogger):

    region: str = "exception"


# 用户上报
class UserLogger(BaseLogger):

    region: str = "user"


# 查询上报
class SearchLogger(BaseLogger):

    region: str = "search"


# 知识库上报
class KnowledgeLogger(BaseLogger):

    region: str = "knowledge"

# 讨论上报
class DiscussionLogger(BaseLogger):

    region: str = "discussion"
