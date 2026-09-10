from test.core.state import ITERATION_LIMIT, AgentState
from langgraph.graph import END
from langchain_core.messages import AIMessage
#  条件路由

def should_continue(state:AgentState):
    # 限制迭代次数
    count = state["iteration_count"]
    if(count>ITERATION_LIMIT):
        return END
    
    # 判断是否能检测到工具调用
    message = state["messages"][-1]
    print(f'路由决策{message}')
    if getattr(message,"tool_calls",None) and isinstance(message,AIMessage):
        return "tool_node"
    
    return END
