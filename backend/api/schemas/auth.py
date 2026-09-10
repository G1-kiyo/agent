from pydantic import BaseModel,EmailStr
from typing import Optional

class Auth(BaseModel):
    account:str | EmailStr
    password:str


class Token(BaseModel):
    access_token:str
    type:str

