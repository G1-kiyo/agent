from pydantic import BaseModel, ConfigDict
from fastapi import UploadFile, File, Form
from typing import Annotated, Optional
from enum import Enum


class Tag(BaseModel):
    id: int
    tag_name: str

    model_config = ConfigDict(from_attributes=True)


class KnowledgeBaseMetaData(BaseModel):
    id: Optional[int] = None
    title: str
    summary: str
    tags: list[str]
    # 知识库来源：文档上传/查询结果录入
    source: str
    source_url: str

    model_config = ConfigDict(from_attributes=True)


class KnowledgeBaseSaveRequest(BaseModel):
    file_list: Annotated[list[UploadFile], File(...)]
    metadata_list: Annotated[list[KnowledgeBaseMetaData], Form(...)]


class Chat(BaseModel):
    query: str


class DocsRequest(BaseModel):
    topic: Optional[str] = None
    page_size: int
    page_num: int


class KnowledgeStatus(Enum):
    PROCESSING = 1
    DONE = 2
    ERROR = 3


# class TextExtractorRequest(BaseModel):
#     file:Annotated[UploadFile, File(...)]
