from langgraph.graph import StateGraph, START
from .state import AgentState
from capabilities.rag.embeddings import generate_document_vectors, rerank_content
from capabilities.rag.vector_store import search_in_vectors_store
from langgraph.runtime import Runtime
from langchain_core.messages import ToolMessage, SystemMessage, HumanMessage,AIMessage
import uuid
from capabilities.llm.factory import get_agent
from .prompts import SYSTEM_PROMPT
from infrastructure.logging.logger import logger_handler

agent_builder = StateGraph(AgentState)

@logger_handler("knowledge")
# 将文本转换为向量
def step_1_node(state: AgentState, runtime: Runtime):
    tool_call_id = str(uuid.uuid4())
    current_message = state.get("messages")[-1]
    text = ""
    if isinstance(current_message, HumanMessage) and hasattr(
        current_message, "content"
    ):
        text = getattr(current_message, "content")

    result = generate_document_vectors(text)
    return {"query": text, "vectors": result}

@logger_handler("knowledge")
# 直接在store里查询最相近的n条
def step_2_node(state: AgentState, runtime: Runtime):
    tool_call_id = str(uuid.uuid4())
    vectors = state.get("vectors")
    payload_list = search_in_vectors_store(vectors)
    return {"payload_list": payload_list}

@logger_handler("knowledge")
# 通过rerank模型重排
def step_3_node(state: AgentState, runtime: Runtime):
    text = state.get("query")
    tool_call_id = str(uuid.uuid4())
    payload_list = state.get("payload_list")
    rerank_payload_list = rerank_content(text, payload_list)
    context = "通过粗检索和重排之后，筛选出与问题相匹配的文本片段如下："
    for idx,payload in enumerate(rerank_payload_list,1):
        content = payload.get("content","")
        source_url = payload.get("source_url","")
        context += f"{idx}. 原始文本：{content} (来源：{source_url})\n\n"
    tool_message = ToolMessage(content=context, tool_call_id=tool_call_id)
    return {"messages": [tool_message], "payload_list": rerank_payload_list}

@logger_handler("knowledge")
def agent_node(state: AgentState):
    messages = state.get("messages")
    print(f"messgaes>>{messages}")
    llm = get_agent("knowledge_retrival")
    llm_invoke = llm.invoke([SystemMessage(content=SYSTEM_PROMPT)] + messages)
    # return {"messages":[AIMessage(content='# Docker配置总结\n\n## 核心结论\n- 解决Vite在Docker环境中的访问问题需要系统性配置和验证 [容器化前端开发服务（Vite）网络访问问题诊断知识体系]\n- 进入容器调试的命令为：`docker exec -it frontend-1 sh` [容器化前端开发服务（Vite）网络访问问题诊断知识体系]\n\n## 详细分析\n1. **Vite在Docker环境中的访问问题解决方案**：\n   - 确保index.html文件存在于容器中 [容器化前端开发服务（Vite）网络访问问题诊断知识体系]\n   - 配置正确的host和端口设置 [容器化前端开发服务（Vite）网络访问问题诊断知识体系]\n   - 确保Docker端口映射正确配置 [容器化前端开发服务（Vite）网络访问问题诊断知识体系]\n\n2. **容器调试方法**：\n   - 使用`docker exec -it frontend-1 sh`命令进入容器进行调试 [容器化前端开发服务（Vite）网络访问问题诊断知识体系]\n\n##信息来源列表\n### 容器化前端开发服务（Vite）网络访问问题诊断知识体系\n- 来源文档：容器化前端开发服务（Vite）网络访问问题诊断知识体系.txt\n- 文档链接：https://agent-wudongnan.oss-cn-hongkong.aliyuncs.com/容器化前端开发服务（Vite）网络访问问题诊断知识体系.txt\n- 内容摘要：提供了Vite在Docker环境中的访问问题诊断方法，包括容器调试命令和核心配置要点\n- 相关度：高\n\n**注意**：系统返回的所有知识片段内容完全相同，均来自同一文档，可能是重复返回的结果。')]}
    return {"messages":[llm_invoke]}

agent_builder.add_sequence([step_1_node, step_2_node, step_3_node, agent_node])
agent_builder.add_edge(START, "step_1_node")

compile_graph = agent_builder.compile()
