from langgraph.graph import StateGraph, START, END
from .state import AgentState
from test.core.nodes.agent import agent_node
from test.core.nodes.tools import tool_node
from test.core.edges.condition import should_continue
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
agent_builder.add_conditional_edges("agent_node",should_continue,["tool_node",END])
# 从tool调用再回到agent，实现自迭代，直到发现超过迭代次数或者无工具调用才停止
agent_builder.add_edge("tool_node", "agent_node")

agent = agent_builder.compile()
