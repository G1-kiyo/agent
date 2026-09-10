from langgraph.graph import StateGraph, END
from .state import AgentState, ITERATION_LIMIT
from capabilities.llm.factory import get_agent
from langchain_core.messages import SystemMessage, AIMessage
from .prompts import SYSTEM_PROMPT
from langgraph.prebuilt import ToolNode
from .tools import tools
from langgraph.runtime import Runtime
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
from infrastructure.logging.logger import logger_handler

llm = get_agent("news_searcher")


# 输入系统提示词，更新state
@logger_handler("search")
def agent_node(state: AgentState, runtime: Runtime):
    current_count = state["iteration_count"]
    current_messages = state["messages"]
    # 判断是否达到迭代限制
    if current_count >= ITERATION_LIMIT:
        sys_message = "已达到迭代最大上限，禁止调用检索工具。现在，请总结上下文，将拿到的所有结果按照正确的顺序和Markdown格式返回，必须提供完整的文章或图片链接。"
        # final_message = llm.invoke(
        #     current_messages + [SystemMessage(content=sys_message)]
        # )
        ai_message = AIMessage(content='\n根据搜索结果，我为您整理了近期科技公司发布的重要产品信息：\n\n## 主要科技公司产品发布动态\n\n### OpenAI相关\n- **GPT-4.5 Turbo**：据OpenAI官方博客泄露信息，这款产品有望在2024年夏天发布\n- **ChatGPT**：开始拥有电脑历史功能\n\n### Meta相关\n- **Project Glasswing**：新产品项目\n- **Meta Muse Spark**：新产品\n- **Meta Muse**：相关产品发布\n\n### Google相关\n- **Gemini CLI v0.37.0**：Google Gemini工具链的更新版本\n\n### 其他重要信息\n- **iPhone**：全线产品涨价100美元\n- **长鑫科技**：市值超过腾讯，显示科技公司市值变化\n\n### AI工具更新\n- **Cursor**：有官方博客更新，可能涉及新功能发布\n\n需要注意的是，这些信息来自不同的新闻源和博客，部分产品发布时间可能存在差异。建议您关注各公司官方博客和权威科技媒体获取最新、最准确的产品发布信息。\n\n您对哪个特定公司的产品发布更感兴趣？我可以为您搜索更详细的信息。')
        return {
            "messages": [ai_message],
            "iteration_count": current_count,
        } 
    # llm_invoke = llm.invoke([SystemMessage(content=SYSTEM_PROMPT)] + current_messages)
    ai_message = AIMessage(content='\n根据搜索结果，我为您整理了近期科技公司发布的重要产品信息：\n\n## 主要科技公司产品发布动态\n\n### OpenAI相关\n- **GPT-4.5 Turbo**：据OpenAI官方博客泄露信息，这款产品有望在2024年夏天发布\n- **ChatGPT**：开始拥有电脑历史功能\n\n### Meta相关\n- **Project Glasswing**：新产品项目\n- **Meta Muse Spark**：新产品\n- **Meta Muse**：相关产品发布\n\n### Google相关\n- **Gemini CLI v0.37.0**：Google Gemini工具链的更新版本\n\n### 其他重要信息\n- **iPhone**：全线产品涨价100美元\n- **长鑫科技**：市值超过腾讯，显示科技公司市值变化\n\n### AI工具更新\n- **Cursor**：有官方博客更新，可能涉及新功能发布\n\n需要注意的是，这些信息来自不同的新闻源和博客，部分产品发布时间可能存在差异。建议您关注各公司官方博客和权威科技媒体获取最新、最准确的产品发布信息。\n\n您对哪个特定公司的产品发布更感兴趣？我可以为您搜索更详细的信息。')
    return {"messages": [ai_message], "iteration_count": current_count + 1}


tool_node = ToolNode(tools=tools)

@logger_handler("search")
def should_continue(state: AgentState):
    # 限制迭代次数
    count = state["iteration_count"]
    if count > ITERATION_LIMIT:
        return END

    # 判断是否能检测到工具调用
    message = state["messages"][-1]
    print(f"路由决策{message}")
    if getattr(message, "tool_calls", None) and isinstance(message, AIMessage):
        return "tool_node"

    return END

@logger_handler("search")
def generate_compile_graph(saver:AsyncPostgresSaver):
    # 初始这个agent_builder
    agent_builder = StateGraph(AgentState)

    # 声明节点
    agent_builder.add_node("agent_node", agent_node)
    agent_builder.add_node("tool_node", tool_node)

    # 添加path
    # 入口entry
    agent_builder.set_entry_point("agent_node") 

    # 开始自主决策
    # 从agent_node开始
    # 提供决策函数
    agent_builder.add_conditional_edges(
        "agent_node", should_continue, ["tool_node", END]
    )
    # 从tool调用再回到agent，实现自迭代，直到发现超过迭代次数或者无工具调用才停止
    agent_builder.add_edge("tool_node", "agent_node")

    compile_graph = agent_builder.compile(checkpointer=saver)
    return compile_graph


# 初始检查器
# checkpointer = AsyncPostgresSaver(conn=ai_connection_pool)
