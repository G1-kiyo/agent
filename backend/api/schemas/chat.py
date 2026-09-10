from pydantic import BaseModel
from typing import Optional

class Chat(BaseModel):
    query:str
    thread_id:Optional[str] = None
    checkpoint_id:Optional[str] = None