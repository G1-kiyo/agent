# AI 资讯智能检索 Agent（LangGraph 全链路实训 Demo）

## 1. 项目目标

构建一个基于 LangGraph 的智能资讯检索 Agent，能够：

- 接收用户自然语言查询，例如“今天 AI 圈有什么大事”
- 自主决策调用搜索工具获取信息
- 经过多轮迭代，直到信息足够完整
- 输出带完整调用链路日志的答案

---

## 2. 核心功能模块与知识点映射

| 功能模块 | 对应知识点 | 具体实现要求 |
| --- | --- | --- |
| Agent Loop 引擎 | LangGraph 图状态机 | 构建 StateGraph，定义 Agent 节点（LLM 推理）、Tools 节点（工具调用）、Router 条件边（决策下一步）。必须体现多轮循环，而不是一次性完成。 |
| 工具调用层 | Function Calling + Tavily API | 封装 `search_ai_news` 工具，底层调用 Tavily Search API，返回结构化搜索结果。工具描述需让模型明确何时调用。 |
| 提示词系统 | 系统提示词设计 | 编写包含角色定位、工具使用规范、输出格式约束、信息充分性判断的系统提示。模型根据提示决定“继续搜索”还是“生成答案”。 |
| 模型集成 | LangChain 模型统一接口 | 使用 ChatOpenAI 或兼容接口，支持模型可配置。需记录每次 LLM 调用的 token、耗时、返回内容。 |
| 调用日志 | 日志输出 + 可观测性 | 每个节点执行时记录节点名、输入状态、输出状态、耗时，最终生成完整执行链路时间线。 |
| 状态管理 | State 设计 | State 包含 `messages`（对话历史）、`search_results`（累计搜索结果）、`iteration_count`（当前轮次）、`is_complete`（完成标识）。 |
| 记忆持久化 | Checkpointer + 对话归档 | 使用 MemorySaver 或 SqliteSaver 保存图快照。实现按话题自动归档（如 `#AI大模型`、`#AI应用`），下次可恢复特定话题对话。 |
| 人工干预 | `interrupt_before` / `resume` | 在工具调用前设置 `interrupt_before=["tools"]`，模拟人工审核搜索词。恢复执行演示 `resume` 能力。 |
| 断点调试与回溯 | 检查点 + 分叉历史 | 演示 `get_state_history()` 获取执行历史，`update_state()` 从指定检查点分叉重放，开启新时间线。 |
| 确定性重放 | 快照重放 | 保存快照后，演示从同一快照多次重放，每次可修改输入参数，观察不同输出路径。 |
| RAG 扩展预留 | 向量存储 + 检索增强 | 设计一个 `retrieve` 工具，虽然初始用 Tavily，但预留向量检索接口，说明后续可切换为本地知识库。 |
| 多智能体扩展 | 监督者模式 | 预留 Supervisor 节点，未来可将任务拆解为“搜索专员”“总结专员”“核对专员”三个子 Agent，由监督者路由。 |

---

## 3. 技术架构（四层）

```text
┌─────────────────────────────────────────────────┐
│              用户交互层（CLI / API）              │
├─────────────────────────────────────────────────┤
│            LangGraph 执行引擎                    │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────────┐   │
│  │Agent │→│Tools │→│Router│→│Checkpoint│   │
│  │节点   │  │节点   │  │条件边  ││Saver     │   │
│  └──────┘  └──────┘  └──────┘  └──────────┘   │
├─────────────────────────────────────────────────┤
│          LangChain 抽象层（模型/工具/消息）       │
├─────────────────────────────────────────────────┤
│     Tavily API  │  向量库(预留) │  日志存储      │
└─────────────────────────────────────────────────┘
```

---

## 4. 演示场景设计（覆盖所有知识点）

### 场景 1：基础检索（Agent Loop）

- 用户输入：“最近一周 AI 领域有什么融资新闻？”
- 系统提示词引导模型：先搜索 → 评估结果 → 若不足则再搜 → 完整后生成最终答案
- 日志展示：3 轮迭代，每轮调用记录

### 场景 2：人工干预

- 在搜索前中断，用户确认搜索词“AI 融资 2026”是否精准
- 展示 `interrupt_before` 和 `resume` 流程

### 场景 3：断点回溯

- 某次执行中途失败（如 API 超时）
- 展示 `get_state_history()` 获取失败前的检查点
- 演示 `update_state()` 分叉重放，修改搜索参数后继续

### 场景 4：确定性重放

- 保存完整执行快照，不改参数重放 3 次，验证输出完全一致
- 对比日志时间线，展示确定性

### 场景 5：话题归档与恢复

- 对话完成后，自动归档为 `#AI融资` 话题
- 下次启动时，按话题恢复上下文，继续追问

---

## 5. 交付物清单

- 源码：Python 项目，含 `agent.py`、`tools.py`、`prompts.py`、`graph.py`、`checkpointer.py`
- 配置文件：`.env`（API Key）、`config.yaml`（模型/工具开关）
- 演示脚本：`demo_basic.py`、`demo_interrupt.py`、`demo_fork.py`、`demo_replay.py`
- 架构图：PNG 格式的状态机流转图
- 技术文档：每个知识点在代码中的对应位置说明（Markdown）

---

## 6. 技术选型建议

| 组件 | 推荐方案 |
| --- | --- |
| 模型 | OpenAI GPT-4o / 国内 DeepSeek-V3（支持 function calling） |
| 搜索引擎 | Tavily API（免费额度够 demo） |
| 状态持久化 | SqliteSaver（轻量，单文件） |
| 向量库（预留） | Chroma（本地嵌入） |
| 日志 | 标准 logging + 自定义 JSON 格式导出 |

这个方案的核心设计思路是：用同一个“资讯搜索”任务，串联起 LangGraph 的所有核心机制。每个知识点不再是孤立的，而是 Agent 执行流程中的一个环节。

如果认可这个方向，我可以直接给你代码级的技术设计文档，把每个节点的实现逻辑写清楚。你下一步想深入哪块？

---

## 7. 升级版：AI 资讯智能协作平台（Social Agent Hub）

### 7.1 核心理念

这不是一个单纯的搜索 Agent，而是一群人 + AI 共同筛选、讨论、沉淀 AI 资讯的协作平台。

### 7.2 新增社交功能模块与知识点映射

| 社交功能 | 对应知识点 | 具体实现 |
| --- | --- | --- |
| 多用户会话隔离 | State 设计 + 记忆持久化 | 每个用户/群组独立 State，`user_id + thread_id` 隔离。SqliteSaver 按用户分表存储。 |
| 资讯订阅与推送 | Agent Loop + 监督者模式 | Supervisor 节点负责轮询多个订阅源，Router 决策推送给哪些活跃用户。 |
| 协作讨论线程 | 分叉历史（Fork） | 用户 A 分享一条资讯 → 用户 B 从该检查点分叉，开启子讨论（新时间线）。 |
| 人工审核节点 | `interrupt_before` / 审核节点 | 敏感资讯发布前，中断等待管理员审核。`resume` 批准后继续分发。 |
| 观点聚合与投票 | 多智能体（Multi-Agent） | 三个 Agent（正、反、中立）分别生成观点 → Supervisor 汇总 → 展示给社群投票。 |
| 话题自动归档 | 记忆持久化 + 分类 | 根据讨论内容自动打标签（`#AI大模型`、`#AI监管`），归档到不同话题空间。 |
| 确定性重放验证 | 确定性重放（Replay） | 社群对某条资讯真实性存疑时，从检查点重放完整检索与推理过程，公开可验证。 |
| 用户行为日志 | 调用日志 + 可观测性 | 记录每个用户的查询、点击、投票、讨论参与度，形成社群活跃度热力图。 |
| 检索结果共享 | RAG + 向量存储 | 优质资讯存入向量库，构建“社群知识库”；新用户可直接通过 RAG 检索历史共识。 |
| 动态路由权限 | Command / Edge 动态决策 | 根据用户等级（普通/专家/管理员），动态路由到不同处理节点。 |

### 7.3 社交场景完整流程演示

```text
用户 A 发起：“谁了解最新的 DeepSeek 动态？”
    ↓
[Agent 节点] 调用 Tavily 搜索
    ↓
[中断节点] 等待 A 确认搜索词精准度（人工干预）
    ↓
[Tools 节点] 执行搜索，返回 5 条资讯
    ↓
[Router 节点] 信息充分 → 生成摘要并发布到社群
    ↓
[社交扩散]
├── 用户 B 看到资讯，从该检查点 Fork 出新线程：“这跟 OpenAI 比如何？”
├── 用户 C 点赞 → 触发 [投票聚合节点] 统计热度
└── 管理员标记为“优质” → 存入 [向量库] 永久归档
    ↓
[监督者节点] 自动将该话题推送给 3 位订阅了“AI大模型”标签的用户
    ↓
[检查点保存] 完整执行历史存为“社群公开可审计日志”
```

### 7.4 技术架构升级（六层）

```text
┌─────────────────────────────────────────────────────────┐
│              用户层（Web / IM / 小程序）                  │
├─────────────────────────────────────────────────────────┤
│            社交逻辑层（群组 / 订阅 / 权限 / 投票）         │
├─────────────────────────────────────────────────────────┤
│              LangGraph 执行引擎（核心图）               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐   │
│  │Agent │→│Tools │→│Router│→│Super │→│Checkpoint│   │
│  │节点   │ │节点   │ │节点   │ │visor │ │Saver     │   │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────────┘   │
├─────────────────────────────────────────────────────────┤
│      LangChain 抽象层（模型 / 工具 / 消息 / 向量）        │
├─────────────────────────────────────────────────────────┤
│    Tavily API  │  向量库(Chroma)  │  关系数据库(用户/群组) │
├─────────────────────────────────────────────────────────┤
│              日志系统（行为追踪 + 审计）                 │
└─────────────────────────────────────────────────────────┘
```

### 7.5 体现知识点的关键代码结构

```python
# 1. State 增加社交字段
class SocialAgentState(TypedDict):
    messages: List[BaseMessage]
    search_results: List[dict]
    user_id: str
    group_id: str
    user_role: str  # "admin" | "expert" | "member"
    thread_parent_id: Optional[str]  # 用于分叉
    votes: int
    tags: List[str]
    is_approved: bool

# 2. 监督者节点（路由到不同 Agent）
def supervisor_node(state):
    if state["user_role"] == "admin":
        return "admin_review_node"
    elif "投票" in state["messages"][-1].content:
        return "voting_agent_node"
    else:
        return "search_agent_node"

# 3. 分叉历史（社交讨论）
def fork_discussion(original_state, new_query):
    config = {"configurable": {"thread_id": f"fork_{uuid4()}"}}
    forked_state = original_state.copy()
    forked_state["messages"].append(HumanMessage(content=new_query))
    return graph.invoke(forked_state, config, from_checkpoint=original_checkpoint)
```

### 7.6 典型社交场景 Demo 清单

| Demo | 演示内容 | 覆盖知识点 |
| --- | --- | --- |
| `demo_social_search.py` | 用户在社群发问 → Agent 搜索 → 结果推送全体 | Agent Loop + Function Call + 日志 |
| `demo_fork_debate.py` | 用户 B 分叉用户 A 的资讯，展开辩论 | 分叉历史 + 状态复制 |
| `demo_admin_review.py` | 敏感资讯发布前中断，管理员审核通过 | `interrupt_before` + `resume` |
| `demo_supervisor_routing.py` | 根据用户等级/话题类型动态路由 | 监督者模式 + Command |
| `demo_knowledge_base.py` | 优质讨论存入向量库，新人 RAG 检索 | RAG + 向量存储 |
| `demo_replay_audit.py` | 社群对结果存疑，重放完整执行链 | 确定性重放 + 检查点 |
| `demo_topic_archive.py` | 自动按话题归档对话（`#AI融资`、`#AI监管`） | 记忆持久化 + 分类路由 |

### 7.7 社交属性带来的额外价值

- 可解释性：社群成员可以“回放”AI 的每一步决策，建立信任
- 众包增强：人工干预节点允许专家修正搜索方向，迭代优化
- 知识沉淀：高质量讨论自动向量化，形成社群独有的 RAG 知识库
- 争议解决：确定性重放 + 分叉历史，可以“平行宇宙”式对比不同决策路径的效果

### 7.8 交互界面示意（CLI 版）

```text
👤 [用户A] 提问：“GPT-5 有什么新能力？”
🤖 [Agent] 正在搜索... (迭代 1)
📊 [日志] 调用 Tavily | 耗时 1.2s | tokens: 150
✋ [中断] 管理员请确认搜索词：“GPT-5 最新能力 2026” [y/n]
✅ [批准] 继续执行...
📰 [结果] 找到 8 条相关资讯
📢 [社群] 发布到 #AI大模型 群组

👤 [用户B] 从该话题分叉：“这和 Claude 4 比谁更强？”
🔀 [Fork] 新线程 ID: fork_xyz | 继承原始检查点
🤖 [Agent] 启动对比搜索...
```
