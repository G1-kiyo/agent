from typing import List

from agents.ai_debater.state import (
    AgentState,
    ClassifySchemaList,
    ClassifySchema,
    OutputSchema,
)
from agents.ai_debater.prompts import get_style_prompt, COORDINATOR_PROMPT
from capabilities.llm.factory import get_agent
from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.types import Send
from api.schemas.discussion import Style
from langgraph.graph import StateGraph, START, END
from utils.datetime import gendatetime, totimestamp


async def cooridinator(agent_state: AgentState):
    messages = agent_state.get("messages", None)
    if messages:
        latest_message = messages[-1]
        llm = get_agent(
            "ai_debater", {"force_schema": True, "output_schema": ClassifySchemaList}
        )
        result = await llm.ainvoke(
            [latest_message, SystemMessage(content=COORDINATOR_PROMPT)]
        )
        # print(f"result:{result.classifications}")
        return {"classifications": getattr(result, "classifications", [])}


def classify(agent_state: AgentState):
    classifications = agent_state.get("classifications", None)
    print(
        f"classification:{classifications[0].style},{classifications[0].theme},{agent_state}"
    )
    if classifications:
        send_list = []
        for c in classifications:
            sender = Send(c.style.value, {"style": c.style.value, "theme": c.theme})
            print(f"node:{c.style.value}, sender:{sender}")
            send_list.append(sender)
        print(f"send_list:{send_list}")
        return send_list
    return END
        


async def subagent(agent_input: ClassifySchema):
    style = agent_input.get("style", None)
    theme = agent_input.get("theme", None)
    if style and theme:

        discussion_info = f"""
                话题背景描述：{theme}
            """
        human_message = HumanMessage(content=discussion_info)
        system_message = SystemMessage(content=get_style_prompt(style))
        llm = get_agent(
            "ai_debater", {"force_schema": True, "output_schema": OutputSchema}
        )
        opinion = await llm.ainvoke([human_message, system_message])

        return {
            "opinions": [
                {
                    **(opinion.model_dump()),
                    "style": Style.to_chinesename(style),
                    "avatar": "https://api.dicebear.com/10.x/big-smile/svg",
                    "create_at": totimestamp(gendatetime()),
                }
            ]
        }
    return {"opinions": []}


async def summarize_result(agent_state: AgentState):
    opinions = agent_state.get("opinions", None)
    if opinions:
        opinion_content = ""
        for idx, o in enumerate(agent_state["opinions"], 1):
            opinion_content += f"观点{idx}: {o}\n"

        llm = get_agent("ai_debater")
        result = await llm.ainvoke(
            [
                HumanMessage(
                    content=f"给定N个观点如下：{opinion_content}，请据此进行600字符以内的观点总结陈词"
                )
            ]
        )
        return {"summary": result.content}
    return {"summary": []}


agent_builder = StateGraph(AgentState)

styles = Style.values()
agent_builder.add_node("coordinator", cooridinator)
for style in styles:
    agent_builder.add_node(style, subagent)
agent_builder.add_node("summarize", summarize_result)
agent_builder.add_edge(START, "coordinator")
agent_builder.add_conditional_edges("coordinator", classify, [*styles, END])
for style in styles:
    agent_builder.add_edge(style, "summarize")
agent_builder.add_edge("summarize", END)

compile_graph = agent_builder.compile()
