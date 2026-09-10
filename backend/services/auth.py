from pwdlib import PasswordHash
from settings import settings
import jwt
from datetime import datetime, timedelta, timezone


SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
EXPIRED_FOR_ACCESS = 3600
EXPIRED_FOR_REFRESH = 7
password_hash = PasswordHash.recommended()


# 加密密码
def get_hash_password(password: str):
    return password_hash.hash(password)


# 验证密码
def verify_password(plain_password: str, hash_password: str):
    return password_hash.verify(plain_password, hash_password)


# 生成JWT Token
def create_access_token(data: dict):
    payload = {
        "iss": "agent",
        "exp": datetime.now(timezone.utc) + timedelta(seconds=EXPIRED_FOR_ACCESS),
        "iat": datetime.now(timezone.utc),
        "type": "access",
    }
    # 创建需要加签的信息
    payload.update(data)
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token


# 生成刷新 Token
def create_refresh_token(data: dict):
    payload = {
        "iss": "agent",
        "exp": datetime.now(timezone.utc) + timedelta(days=EXPIRED_FOR_REFRESH),
        "iat": datetime.now(timezone.utc),
        "type": "refresh",
    }
    # 创建需要加签的信息
    payload.update(data)
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token





