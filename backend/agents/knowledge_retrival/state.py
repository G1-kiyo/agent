from typing import TypedDict,Annotated,List
import operator
from langchain_core.messages import BaseMessage
from capabilities.rag.vector_store import DocumentEmbeddingPayload

class AgentState(TypedDict):
    messages:Annotated[List[BaseMessage],operator.add]
    query:str
    vectors:List[float]
    payload_list:List[DocumentEmbeddingPayload]
    
