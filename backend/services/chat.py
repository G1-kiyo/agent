import json
from api.deps import SaverDep
from api.schemas.chat import Chat
from agents.news_searcher.graph import generate_compile_graph
from langchain_core.messages import HumanMessage, AIMessage
import uuid
from infrastructure.logging.logger import logger_handler, SearchLogger


# 调用agent
@logger_handler("search")
async def search(chat: Chat, saver: SaverDep):
    try:
        compile_graph = generate_compile_graph(saver)
        thread_id = chat.thread_id
        checkpoint_id = chat.checkpoint_id
        config = {}
        if thread_id and checkpoint_id:
            print(f"search again{thread_id}")
            config = {
                "configurable": {
                    "thread_id": thread_id,
                    "checkpoint_id": checkpoint_id,
                }
            }
        else:
            thread_id = str(uuid.uuid4())
            config = {"configurable": {"thread_id": thread_id}}
        async for chunk in compile_graph.astream(
            {
                "messages": [HumanMessage(content=chat.query)],
                "is_complete": False,
                "iteration_count": 0,
                "search_results": [],
            },
            stream_mode=["updates", "values"],
            config=config,
            version="v2",
        ):
            if chunk["type"] == "updates":

                # 获取state历史列表，判断最新的next是不是agent_node，是的话获取相关的信息并返回

                snapshot_generator = compile_graph.aget_state_history(
                    {
                        "configurable": {
                            "thread_id": thread_id,
                            "checkpoint_id": "",
                        }
                    }
                )
                history_list = []
                async for s in snapshot_generator:
                    print(f"history:{s.next}")
                    history_list.append(s)
                snapshot = (
                    history_list[0] if "agent_node" in history_list[0].next else None
                )
                if snapshot:
                    cur_checkpoint_id = snapshot.config.get("configurable", {}).get(
                        "checkpoint_id"
                    )
                    cur_thread_id = snapshot.config.get("configurable", {}).get(
                        "thread_id"
                    )
                    print(f"parent_config{config}")
                    parent_config = {
                        "thread_id": config.get("configurable", {}).get(
                            "thread_id", ""
                        ),
                        "checkpoint_id": config.get("configurable", {}).get(
                            "checkpoint_id", ""
                        ),
                    }
                    latest_state = snapshot.values
                    latest_messages = latest_state.get("messages")
                    latest_iteration = latest_state.get("iteration_count")
                    query = ""
                    if latest_messages:
                        m = latest_messages[-1]
                        if m and isinstance(m, AIMessage) and hasattr(m, "content"):
                            query = getattr(m, "content")

                    checkpoint_info = {
                        "thread_id": cur_thread_id,
                        "checkpoint_id": cur_checkpoint_id,
                        "parent": parent_config,
                        "query": query,
                    }
                    result = {
                        "checkpoint_info": checkpoint_info,
                        "iteration_count": (
                            latest_iteration + 1 if latest_iteration else 1
                        ),
                    }
                    yield f"data: {json.dumps(result,ensure_ascii=False)}\n\n"

            if chunk["type"] == "values":
                # 声明结果
                result = {"message": "", "iteration_count": 0, "is_final": False}
                states = chunk["data"]
                messages = states.get("messages")
                if messages:
                    current_message = messages[-1]
                    # 只要AI响应
                    print(f"类型：{type(current_message)}", current_message)
                    if not isinstance(current_message, HumanMessage) and hasattr(
                        current_message, "content"
                    ):
                        if isinstance(current_message, AIMessage) and not getattr(
                            current_message, "tool_calls", None
                        ):
                            result["message"] = (
                                ("\n" + current_message.content)
                                if current_message.content
                                else ""
                            )
                            result["is_final"] = True
                        else:
                            result["message"] = (
                                ("\n" + current_message.content)
                                if current_message.content
                                else ""
                            )

                    # 获取迭代次数
                    iteration_count = states.get("iteration_count", 0)
                    result["iteration_count"] = iteration_count
                    # 必须得加上ensure_ascii为false否则就按照ascii输出了
                    yield f"data: {json.dumps(result,ensure_ascii=False)}\n\n"
    except Exception as e:
        SearchLogger.error("search error")
        error = {"error": str(e)}
        yield f"data: {json.dumps(error,ensure_ascii=False)}\n\n"
