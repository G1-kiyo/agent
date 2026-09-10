from fastapi import Request, WebSocket
from infrastructure.logging.logger import ExceptionLogger
from fastapi.responses import JSONResponse
from api.schemas.base import BusinessCode, BaseResponse
from fastapi.exceptions import HTTPException, WebSocketException
from sqlalchemy.exc import IntegrityError
from asyncpg.exceptions import UniqueViolationError, NotNullViolationError
import json

# 异常处理
# 需要做异常log，并统一返回500的状态码 返回内容是内部服务器异常


async def exception_handler(request: Request, exc: Exception):
    ExceptionLogger.error(
        msg=f"internal server error-{str(exc)}", extra={"request_url": request.url.path}
    )

    return JSONResponse(
        content=BaseResponse(
            code=BusinessCode.INTERNAL_ERROR, data=None, msg="internal server error"
        ).model_dump(),
        status_code=BusinessCode.INTERNAL_ERROR.value,
    )


async def http_exception_handler(request: Request, exc: HTTPException):

    ExceptionLogger.error(
        msg=f"internal server error-{str(exc)}",
        extra={"request_url": request.url.path},
    )
    return JSONResponse(
        content=BaseResponse(
            code=exc.status_code, data=None, msg=exc.detail
        ).model_dump(),
        status_code=exc.status_code,
    )


async def sql_exception_handler(request: Request, exc: IntegrityError):
    original_exp = exc.orig
    ExceptionLogger.error(
        msg=f"sql operation error-{str(original_exp)}",
        extra={"request_url": request.url.path},
    )
    print(
        f"exception>>{type(original_exp),original_exp.sqlstate,isinstance(original_exp, UniqueViolationError)}"
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
        print(f"uniqueerror>>")
        return JSONResponse(
            content=BaseResponse(
                code=int(original_exp.sqlstate), data=None, msg="data already existed"
            ).model_dump(),
            status_code=200,
        )

    return JSONResponse(
        content=BaseResponse(
            code=BusinessCode.INTERNAL_ERROR, data=None, msg="internal server error"
        ).model_dump(),
        status_code=BusinessCode.INTERNAL_ERROR.value,
    )

async def websocket_exception_handler(websocket:WebSocket,exc:WebSocketException):
    
    ExceptionLogger.error(
            msg=f"webspcket connection error-{str(exc)}",
            extra={"request_url": websocket.url},
        )
    error_msg = {"event":"reporterror","payload":{"code":exc.code,"reason":exc.reason}}
    await websocket.send_text(json.dumps(error_msg))
    await websocket.close(code=exc.code,reason=exc.reason)
    
