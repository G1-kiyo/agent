from fastapi import Request, WebSocket, status
from infrastructure.logging.logger import ExceptionLogger
from fastapi.responses import JSONResponse
from api.schemas.base import BusinessCode, BaseResponse
from fastapi.exceptions import HTTPException, WebSocketException
from sqlalchemy.exc import IntegrityError
from asyncpg.exceptions import UniqueViolationError
import json

# 异常处理
# 需要做异常log，并统一返回500的状态码 返回内容是内部服务器异常


async def exception_handler(request: Request, exc: Exception):
    ExceptionLogger.error(
        msg=f"internal server error-{exc!s}", extra={"request_url": request.url.path}
    )

    return JSONResponse(
        content=BaseResponse(
            code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            data=None,
            msg="internal server error",
        ).model_dump(),
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


async def http_exception_handler(request: Request, exc: HTTPException):

    ExceptionLogger.error(
        msg=f"internal server error-{exc!s}",
        extra={"request_url": request.url.path},
    )
    return JSONResponse(
        content=BaseResponse(
            code=getattr(exc, "custom_code", exc.status_code),
            data=None,
            msg=exc.detail,
        ).model_dump(),
        status_code=exc.status_code,
    )


async def sql_exception_handler(request: Request, exc: IntegrityError):
    original_exp = exc.orig
    ExceptionLogger.error(
        msg=f"sql operation error-{original_exp!s}",
        extra={"request_url": request.url.path},
    )
    print(
        f"exception>>{type(original_exp), original_exp.sqlstate, isinstance(original_exp, UniqueViolationError)}"
    )
    # 判断是什么类型
    # notnull
    if original_exp.sqlstate == "23502":
        return JSONResponse(
            content=BaseResponse(
                code=int(original_exp.sqlstate), data=None, msg="null is not allowed"
            ).model_dump(),
            status_code=200,
        )
    elif original_exp.sqlstate == "23505":
        return JSONResponse(
            content=BaseResponse(
                code=int(original_exp.sqlstate), data=None, msg="data already existed"
            ).model_dump(),
            status_code=200,
        )

    return JSONResponse(
        content=BaseResponse(
            code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            data=None,
            msg="internal server error",
        ).model_dump(),
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


async def websocket_exception_handler(websocket: WebSocket, exc: WebSocketException):

    ExceptionLogger.error(
        msg=f"webspcket connection error-{exc!s}",
        extra={"request_url": websocket.url},
    )
    error_msg = {
        "event": "reporterror",
        "payload": {"code": exc.code, "reason": exc.reason},
    }
    await websocket.send_text(json.dumps(error_msg))
    await websocket.close(code=exc.code, reason=exc.reason)


class CustomHTTPException(HTTPException):
    def __init__(
        self,
        status_code=status.HTTP_200_OK,
        custom_code=BusinessCode.BUSINESS_FAILURE.value,
        detail=None,
        headers=None,
    ):
        super().__init__(status_code, detail, headers)
        self.custom_code = custom_code
