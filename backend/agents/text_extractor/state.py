from typing import List
from pydantic import BaseModel,Field
from api.schemas.discussion import CategoryName

# 文本提取，需要提取出标题、摘要、话题标签
class AnswerWithJustification(BaseModel):
    title: str = Field(description="文章标题")
    summary: str = Field(description="文章摘要")
    tags: List[str] = Field(description="话题标签列表")

class DiscussionSchema(BaseModel):
    is_valid:bool = Field(description="判断当前话题是否有效")
    title: str = Field(description="话题标题")
    category:CategoryName = Field(description="话题分类")
    desc:str = Field(description="话题描述")