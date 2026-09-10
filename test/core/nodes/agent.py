from test.core.state import AgentState,ITERATION_LIMIT
from langchain_core.messages import SystemMessage
from capabilities.llm.prompts import SYSTEM_PROMPT
from capabilities.llm.factory import llm_with_tools

# 输入系统提示词，更新state
def agent_node(state:AgentState):
    current_count = state["iteration_count"]
    current_messages = state["messages"]
    # 判断是否达到迭代限制
    if current_count>=ITERATION_LIMIT:
        sys_message = "已达到迭代最大上限，禁止调用检索工具。现在，请总结上下文，将拿到的所有结果按照正确的顺序和Markdown格式返回，必须提供完整的文章或图片链接。"
        final_message = llm_with_tools.invoke(current_messages+[SystemMessage(content=sys_message)])
        return {
            "messages":[final_message],
            "iteration_count":current_count,
        }
    
    llm_invoke = llm_with_tools.invoke([SystemMessage(content=SYSTEM_PROMPT)]+current_messages) 
    print(f"llm_invoke{llm_invoke}")
    return {
        "messages": [
            llm_invoke
        ],
        "iteration_count":current_count + 1
    }

