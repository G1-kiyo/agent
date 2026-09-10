from langchain.tools import tool
from langgraph.prebuilt import InjectedState
from tavily import TavilyClient
from settings import settings
from typing import Annotated
from langgraph.types import Command
from langchain_core.messages import ToolMessage
from langchain_core.tools import InjectedToolCallId

API_KEY = settings.TAVILY_API_KEY

# 定义tool

# 搜索tool，入参是搜索语句
# 初始化travily，调用搜索api获取查询结果，并返回
@tool(description="这是检索ai资讯相关的工具")
def search_results(query:str, agentState:Annotated[dict,InjectedState],tool_call_id:Annotated[str, InjectedToolCallId]):
    """这是一个全网实时信息搜索工具。
    当用户需要查询、检索关于 AI 资讯、大模型工作流、或者是任何需要联网查询的最新动态时，必须调用此工具。

    Args:
        query: 传给搜索引擎的具体查询关键词或短语，例如：'AI工作流最新进展'。
    """
    tavily_client = TavilyClient(api_key=API_KEY)
    current_search_results = agentState["search_results"]
    print(f'search_results{current_search_results}')
    try:
        response = tavily_client.search(
            query=query,
            time_range="week",
            max_results=5,
            include_images=True,
            include_image_descriptions=True,
            include_answer=True,
            include_raw_content=True,
        )
        # print(f"-----搜索执行完成，返回结果:{response.results}-----")
        if response and response.get("results"):
            results = response.get("results")
            all_answers = ""
            data = []
            for idx, result in enumerate(results, len(current_search_results) + 1):
                image = result.images[0] if getattr(result, "images", None) else None
                image_url = image.get("url") if image else None
                image_desc = image.get("description") if image else None

                answer = ""
                answer += f"## {idx}. [{result.get('title')}]({result.get('url')})\n"
                answer += "---\n"

                if image_url:
                    answer += f"![{image_desc or '图片'}]({image_url})\n"
                if image_desc:
                    answer += f"{image_desc}\n"
                if image_url or image_desc:
                    answer += "---\n"

                if getattr(result, "content", None):
                    answer += f"{result.get('content')}\n"

                if getattr(result, "score", None):
                    answer += f"相关性: {result.get('score')}\n"

                answer += "\n"
                all_answers += answer
                data.append(answer)
            if getattr(response, "answer", None):
                all_answer += f"\n## AI 总结\n{response.get('answer')}"

            return Command(
                update={
                    "messages":[ToolMessage(content=all_answers,tool_call_id=tool_call_id)],
                    "search_results":data
                }
            )
        return "未找到相关结果"
    except Exception as e:
        return f"搜索执行出错，具体原因: {e}"

tools = [search_results]
# tools_by_name = {tool.name: tool for tool in tools}