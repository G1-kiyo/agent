from pydantic import BaseModel,field_serializer
from enum import Enum
from typing import Any,Generic,TypeVar,Optional

T = TypeVar('T')

class BusinessCode(Enum):
    BUSINESS_SUCCESS = 0
    BUSINESS_FAILURE = 1
    INTERNAL_ERROR = 500


class BaseResponse(BaseModel,Generic[T]):
    code:BusinessCode | int
    data:Optional[T] = None
    msg:str

    @field_serializer("code")
    def serialize_code(self,code:BusinessCode | int):
        return code.value if isinstance(code,BusinessCode) else code

    @classmethod
    def success(cls,data:Any,msg:str):
        return cls(code=BusinessCode.BUSINESS_SUCCESS,data=data,msg=msg)

    @classmethod
    def failure(cls,data:Any,msg:str):
        return cls(code=BusinessCode.BUSINESS_FAILURE,data=data,msg=msg)