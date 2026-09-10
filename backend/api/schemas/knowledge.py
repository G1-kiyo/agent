from pydantic import BaseModel, ConfigDict
from fastapi import UploadFile, File, Form
from typing import Annotated, List, Optional

class Tag(BaseModel):
    id:int
    tag_name:str

    model_config = ConfigDict(from_attributes=True)

class KnowledgeBaseMetaData(BaseModel):
    id: Optional[int] = None
    title: str
    summary: str 
    tags: List[str]
    # 知识库来源：文档上传/查询结果录入
    source: str
    source_url: str

    model_config = ConfigDict(from_attributes=True)


class KnowledgeBaseSaveRequest(BaseModel):
    file_list: Annotated[List[UploadFile], File(...)]
    metadata_list: Annotated[List[KnowledgeBaseMetaData], Form(...)]


class Chat(BaseModel):
    query: str


class DocsRequest(BaseModel):
    topic: Optional[str] = None
    page_size: int
    page_num: int


# class TextExtractorRequest(BaseModel):
#     file:Annotated[UploadFile, File(...)]
