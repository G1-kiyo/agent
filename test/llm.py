import os

try:
    from zai import ZhipuAiClient
except Exception as exc:
    ZhipuAiClient = None
    ZHIPU_AI_IMPORT_ERROR = exc
else:
    ZHIPU_AI_IMPORT_ERROR = None

from test.prompt import SYSTEM_PROMPT
from test.function import tools, get_ai_results

print('---仅测试---')

def build_messages(system_prompt, user_prompt):
    return [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]


def main():
    if ZHIPU_AI_IMPORT_ERROR is not None:
        print(f"智谱AI SDK 未正确安装：{ZHIPU_AI_IMPORT_ERROR}")
        return

    api_key = os.environ.get("ZHIPU_AI_API_KEY")
    if not api_key:
        print("请先设置 ZHIPU_AI_API_KEY 环境变量")
        return

    client = ZhipuAiClient(api_key=api_key)
    user_prompt = "我想要了解最新的AI资讯"
    history = [user_prompt]

    for i in range(5):
        try:
            print(f"-----开启第{i + 1}次循环-----")
            print("-----正在发起大模型请求-----")
            response = client.chat.completions.create(
                model="glm-5.2",
                messages=build_messages(SYSTEM_PROMPT, "\n".join(history)),
                tools=tools,
                thinking={"type":'enabled', "clear_thinking": True}
            )
            print("-----大模型请求完成-----")
            if response and getattr(response, "choices", None):
                for item in response.choices:
                    if(getattr(item,"message",None)):
                        content = getattr(item.message, "content", None)
                        reasoning_content = getattr(item.message, "reasoning_content", None)
                        tool_list = getattr(item.message, "tool_calls", None)

                        for tool in tool_list:
                            function = getattr(tool, "function", None) if tool else None
                            function_name = getattr(function,"name",None) if function else None
                            if(function_name == 'get_ai_results'):
                                print(f"-----调用函数{function_name}-----")
                                function_response = get_ai_results()
                                print(f"-----函数{function_name}响应:{function_response}-----")
                                history.append(str(function_response))
                        
                        
                        if content:
                            print(f"-----大模型响应:{content}-----")
                            history.append(str(content))
                        
                        if reasoning_content:
                            print(f"-----大模型推理结果:{reasoning_content}-----")

        except Exception as e:
            print(f"-----大模型请求出错，具体原因:{e}-----")


if __name__ == "__main__":
    main()

