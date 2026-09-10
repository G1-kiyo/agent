from agents.news_searcher.tools import tools

# 注册所有agents的tools

tools_map = {
    "knowledge_retrival": [],
    "news_searcher": tools,
    "text_extractor": [],
    "ai_debater": [],
}
