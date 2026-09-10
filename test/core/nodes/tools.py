from langchain_core.messages import AIMessage,ToolMessage
from test.core.state import AgentState
from capabilities.tools.web_search import tools_by_name,tools
from langgraph.prebuilt import ToolNode

# 执行tool 并将返回结果更新到state
# def tool_node(state:AgentState):
#     # 不能直接修改state，必须要返回，由langchain追加
#     tool_results = []
#     # 从最新AImessage里拿到tool_calls
#     # 先判断最新的是不是aimessage类型
#     current_message = state["messages"][-1]
#     current_search_results = state["search_results"]
#     new_search_results = []
#     print(f'current_message{current_message}')
#     if not isinstance(current_message,AIMessage):
#         return {"messages":[]}
#     for tool_call in current_message.tool_calls:
#         # 拿到tool_name
#         tool = tools_by_name[tool_call["name"]]
#         # 执行tool，传入参数
#         content = tool.invoke(tool_call["args"], state)
#         tool_results.append(ToolMessage(content=content,tool_call_id=tool_call["id"]))

#         # 同时更新到search
#         if tool_call.get("name","") and tool_call["name"]=="search_results":
#             new_search_results.append(*content)
#     return {"messages":tool_results,"search_results":current_search_results+new_search_results}


tool_node = ToolNode(tools)