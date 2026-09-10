
from fastapi import HTTPException,status
import jwt
from jwt.exceptions import InvalidTokenError,ExpiredSignatureError
from api.schemas.user import User as UserModel, UserUpdate
from api.deps import SessionDep
from sqlalchemy import select
from infrastructure.database.models.user import User
from services.auth import get_hash_password
from api.schemas.auth import Auth
from .auth import ALGORITHM, SECRET_KEY, create_access_token, verify_password
from utils.snowflake_generate import snowflake_generate


# 用户注册
async def register_user(user:UserModel, db:SessionDep):
    #  检查用户是否存在
    stmt = select(User).where((User.username == user.username) | (User.email == user.email))
    result = await db.scalars(stmt)
    if result.first():
        return False
    #  创建新用户
    random_id = await snowflake_generate.generate()
    new_user = User(
        id=random_id,
        username=user.username,
        email=user.email,
        password=get_hash_password(user.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return True 

# 用户注销
async def del_user(user: str, db:SessionDep):
    # 检查用户是否存在
    stmt = select(User).where((User.username == user) | (User.email == user))
    result = await db.scalars(stmt)
    target_user = result.first()
    if not target_user:
        return False
    # 删除用户
    await db.delete(target_user)
    await db.commit()
    return True

# 修改个人信息
async def update_user(user:str, update_payload:UserUpdate, db:SessionDep):
    stmt = select(User).where((User.username == user) | (User.email == user))
    result = await db.scalars(stmt)
    target_user = result.first()
    if not target_user:
        return False
    # 更新用户信息
    data = update_payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        if(hasattr(target_user, key)):
            new_val = value
            # 如果是要更新密码 就对密码进行加密再更新
            if(key=='password'):
                new_val = get_hash_password(new_val)
            setattr(target_user, key, new_val)
    await db.commit()
    await db.refresh(target_user)
    return True
#  查询个人信息
async def get_user_by_nameoremail(user:str, db:SessionDep):
    stmt = select(User).where((User.username == user) | (User.email == user) )
    result = await db.scalars(stmt)
    target_user = result.first()
    if not target_user:
        return False
    return target_user

#  查询个人信息
async def get_user_by_id(user:str, db:SessionDep):
    stmt = select(User).where((User.id == int(user)))
    result = await db.scalars(stmt)
    target_user = result.first()
    if not target_user:
        return False
    return target_user

# 验证用户身份
async def authenticate_user(auth:Auth, db:SessionDep):
    # 获取name或email 查找用户是否存在
    stmt = select(User).where((User.username==auth.account) | (User.email==auth.account))
    result = await db.scalars(stmt)
    user = result.first()
    if not user:
        return False
    # 校验密码
    hash_password = user.password
    plain_password = auth.password
    if not verify_password(plain_password,hash_password):
        return False
    return UserModel.model_validate(user)



    


async def refresh_exchange_access(refresh_token:str,db:SessionDep):
    credentials_exception=HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate":"Bearer error=\"invalid_token\""}
    )
    expire_exception=HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token has expired",
        headers={"WWW-Authenticate":"Bearer error=\"expired_token\""}
    )
    # # 从token解析用户信息
    # payload = jwt.decode(refresh_token,SECRET_KEY,algorithms=[ALGORITHM])
    # print(f'jwt解析结果{payload}')
    # token_type = payload.get("type")
    # if(token_type != "refresh"):
    #     raise credentials_exception
    # user = payload.get("sub")
    # # 看是否有携带用户信息
    # if user is None:
    #     raise credentials_exception
    # # 判断用户是否真实有效
    # exist_user = get_user_by_id(user,db)
    # if exist_user is None:
    #     raise credentials_exception
    # # 验证通过，生成新的access_token
    # return create_access_token({"sub":user})
    try:
        payload = jwt.decode(refresh_token,SECRET_KEY,algorithms=[ALGORITHM])
        print(f'jwt解析结果{payload}')
        token_type = payload.get("type")
        if(token_type != "refresh"):
            raise credentials_exception
        user = payload.get("sub")
        # 看是否有携带用户信息
        if user is None:
            raise credentials_exception
        # 判断用户是否真实有效
        exist_user = await get_user_by_id(user,db)
        print(f'当前用户:{exist_user}')
        if exist_user is None:
            raise credentials_exception
        # 验证通过，生成新的access_token
        return create_access_token({"sub":user})
    except InvalidTokenError:
        print('触发了')
        raise credentials_exception
    except ExpiredSignatureError:
        raise expire_exception