from typing import List
from typing_extensions import TypedDict,Annotated
from langchain_core.messages import BaseMessage
import operator
from snowflake_id_toolkit import TwitterSnowflakeIDGenerator
from datetime import datetime

sync_snowflake_generator = TwitterSnowflakeIDGenerator(node_id=0,epoch=int(datetime(2026,1,1,0,0,0).timestamp()*1000))

ITERATION_LIMIT = 2
class AgentState(TypedDict):
    # 咨询查询专家专用
    news_searcher_messages: Annotated[List[BaseMessage],operator.add]
    # 咨询检索结果列表
    search_results: Annotated[List[str],operator.add]
    iteration_count:int
    is_complete:bool

id = sync_snowflake_generator.generate_next_id()
print(f"id:{id}")

