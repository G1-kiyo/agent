from fastapi import APIRouter, Cookie
from fastapi.responses import JSONResponse
from api.schemas.user import User, UserUpdate
from api.schemas.auth import Auth, Token
from services.user import register_user, del_user, update_user
from api.deps import SessionDep, UserAuth, RedisClient
from services.auth import create_access_token, create_refresh_token
from services.user import authenticate_user, refresh_exchange_access
from api.schemas.base import BaseResponse
from infrastructure.logging.logger import UserLogger

user_router = APIRouter()


@user_router.post("/user/login")
async def login(auth: Auth, db: SessionDep, rds:RedisClient):
    # 验证用户信息
    user = await authenticate_user(auth, db)
    if not user:
        return BaseResponse.failure(data=None, msg="User is invalid")
    # 生成token
    access_token = create_access_token({"sub": str(user.id)})
    token_model = Token(access_token=access_token, type="Bearer")
    content = BaseResponse.success(data={**token_model.model_dump(),"username":user.username}, msg="login success")
    response = JSONResponse(content=content.model_dump())
    refresh_token = create_refresh_token({"sub": str(user.id)})
    UserLogger.info("get user token",extra={"refresh_token":refresh_token,"access_token":access_token})

    await rds.hset(f"user:basicinfo:{user.id}",mapping=user.model_dump())
    # 直接将refresh_token保存在cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="strict",
        secure=True,
        max_age=7 * 24 * 60 * 60,
    )

    return response


@user_router.post("/user/refresh")
# 直接从cookie里面取
async def refresh(db: SessionDep, refresh_token: str = Cookie(None)):
    access_token = await refresh_exchange_access(refresh_token, db)
    return BaseResponse.success(
        data=Token(access_token=access_token, type="Bearer"),
        msg="refresh token success",
    )


@user_router.post("/user/register")
async def register(user: User, db: SessionDep):
    result = await register_user(user, db)
    if not result:
        return BaseResponse.failure(data=None, msg="User already existed")
    return BaseResponse.success(data=result, msg="register success")


@user_router.delete("/user/delete")
async def delete(user: str, ua: UserAuth, db: SessionDep):
    result = await del_user(user, db)
    if not result:
        return BaseResponse.failure(data=None, msg="User does not exist")
    return BaseResponse.success(data=result, msg="delete success")


@user_router.put("/user/update")
async def update(user: str, ua: UserAuth, update_payload: UserUpdate, db: SessionDep):
    result = await update_user(user, update_payload, db)
    if not result:
        return BaseResponse.failure(data=None, msg="User does not exist")
    return BaseResponse.success(data=result, msg="update success")


@user_router.get("/user/me",response_model=BaseResponse[User])
async def get(ua: UserAuth, db: SessionDep):
    print(f"type>>{type(ua)}")
    return BaseResponse.success(data=ua, msg="get userinfo success")
