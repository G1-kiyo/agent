import os

try:
    from tavily import TavilyClient
except Exception:
    TavilyClient = None


def get_ai_results():
    if TavilyClient is None:
        return "未安装 tavily 包，无法调用搜索工具。"

    api_key = os.environ.get("TAVILY_API_KEY")
    if not api_key:
        return "找不到配置的 TAVILY_API_KEY"

    tavily_client = TavilyClient(api_key=api_key)
    query = "我想要了解最新的AI资讯"

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
            answer = ""
            for idx, result in enumerate(results, 1):
                image = result.images[0] if getattr(result, "images", None) else None
                image_url = image.get("url") if image else None
                image_desc = image.get("description") if image else None

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

            if getattr(response, "answer", None):
                answer += f"\n## AI 总结\n{response.get('answer')}"

            return answer
        return "未找到相关结果"
    except Exception as e:
        return f"搜索执行出错，具体原因: {e}"


tools = [
    {
        "type": "function",
        "function":{
            "name": "get_ai_results",
            "description": "Get the latest AI news and information.",
        },
    }
]