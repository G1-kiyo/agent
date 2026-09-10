from typing import List
from typing_extensions import TypedDict,Annotated
from langchain_core.messages import BaseMessage
import operator

ITERATION_LIMIT = 2
class AgentState(TypedDict):
    # 咨询查询专家专用
    messages: Annotated[List[BaseMessage],operator.add]
    # 咨询检索结果列表
    search_results: Annotated[List[str],operator.add]
    iteration_count:int
    is_complete:bool