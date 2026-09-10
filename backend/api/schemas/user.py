from pydantic import BaseModel,EmailStr, Field,field_validator,ConfigDict
from typing import Optional


class User(BaseModel):
    id:Optional[int] = None
    username: str = Field(..., min_length=3)
    password: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)

    # @field_validator("id",mode="before")
    # @classmethod
    # def validate_id(cls, id):
    #     return str(id)

    

class UserUpdate(BaseModel):
    username:Optional[str] = None
    password:Optional[str] = None
    email:Optional[str] = None

    