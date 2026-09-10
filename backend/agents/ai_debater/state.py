from typing import TypedDict,List,Annotated
from langchain_core.messages import BaseMessage
import operator
from pydantic import BaseModel,Field
from api.schemas.discussion import Style
import datetime

class ClassifySchema(BaseModel):
    style:Style = Field(description="辩论风格")
    theme:str = Field(description="话题描述")

class ClassifySchemaList(BaseModel):
    classifications:List[ClassifySchema] = Field(description="这是一个由辩论风格和话题描述对象构成的列表，可以根据此列表安排对应辩论风格的agent进行话题辩论")

class OutputSchema(BaseModel):
    author:str = Field(description="随机生成的与辩论风格一致的用户姓名")
    content:str = Field(description="辩论观点")

class AgentState(TypedDict):
    messages:Annotated[List[BaseMessage],operator.add]
    classifications:List[ClassifySchema]
    opinions:Annotated[List[OutputSchema],operator.add]
    summary:str

