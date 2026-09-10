from langchain_openai import ChatOpenAI
from settings import settings
from .tools_registry import tools_map
import langchain
from typing_extensions import TypedDict
from pydantic import BaseModel
langchain.debug = True

API_KEY=settings.ZHIPU_API_KEY

class AgentConfig(TypedDict):
    force_schema:bool
    output_schema:BaseModel

def get_agent(agent_name:str, agent_config:AgentConfig = {}):
    force_schema = agent_config.get("force_schema",None)
    output_schema = agent_config.get("output_schema",None)
    # 初始化大模型
    llm = ChatOpenAI(
        temperature=0.7,
        model="glm-4.5-air",
        openai_api_key=API_KEY,
        streaming=True,
        openai_api_base="https://api.z.ai/api/paas/v4/",
    )
    if force_schema:
        return llm.with_structured_output(output_schema,method="json_mode")
    llm_with_tools = llm.bind_tools(tools=tools_map[agent_name])
    return llm_with_tools