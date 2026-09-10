# 知识库页面开发设计方案

> **文档版本**: v2.0  
> **创建日期**: 2026-08-01  
> **最后更新**: 2026-08-01（v2.0 对齐现有目录结构与组件抽取方式）  
> **负责人**: 前端开发团队  
> **关联任务**: 前端开发任务 #4 知识库页面开发

---

## 一、设计目标

基于 PRD 模块三「知识沉淀」的需求，构建知识库页面，实现以下核心能力：

1. **RAG 检索**：基于向量库的语义检索与增强问答
2. **文档入库**：支持外部文档上传 + 检索结果一键归档
3. **话题归档**：自动/手动打标签，按话题空间浏览内容
4. **问答交互**：基于知识库的对话式问答，答案含来源引用

同时完成两件事：

5. **页面抽取**：将 `App.jsx` 中内联的「知识库」面板抽取为独立的 `KnowledgePage` 组件，方式与「智能检索」抽取为 `SearchPage` 完全一致。
6. **检索页联动**：智能检索页 `SearchPage` 的「保存到知识库」入口接入知识库入库流程。

---

## 二、整体架构

### 2.1 页面布局

知识库页面采用三栏布局，与现有「智能检索页」风格保持一致：

```
┌─────────────────────────────────────────────────────────────┐
│  知识库 Header（标题 + 统计 + 上传按钮）                        │
├──────────────────┬──────────────────────────────────────────┤
│                  │                                          │
│  左栏：话题导航    │          主区域：RAG 检索 + 问答            │
│  - 话题标签云     │          ┌──────────────────────────┐    │
│  - 热门话题       │          │  RAG 检索框               │    │
│  - 我的文档       │          └──────────────────────────┘    │
│                  │          ┌──────────────────────────┐    │
│  统计卡片         │          │  问答对话区               │    │
│  - 文档总数       │          │  - 用户问题               │    │
│  - 话题数         │          │  - AI 回答 + 来源引用      │    │
│                  │          └──────────────────────────┘    │
│                  │                                          │
├──────────────────┴──────────────────────────────────────────┤
│  底部：文档列表（最近入库 / 按话题筛选）                         │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 目录结构（与现有代码库保持一致）

> **原则**：严格对齐「智能检索」已有的组织方式——
> - 组件**平铺**在 `src/components/` 下，每个组件独立文件夹，含 `.jsx` + `.css`；
> - 自定义 hook 平铺在 `src/hooks/`；
> - 页面文件夹 `src/pages/<Page>/` **只放页面 `.jsx`**；
> - mock 数据放在某个组件文件夹的 `data/` 子目录下（参照 `components/ComprehensiveResults/data/mockData.js`），由页面统一 import。

```
frontend/src/
├── components/
│   ├── index.js                          # 新增 KnowledgeComponents 导出组（参照 SearchComponents）
│   ├── KnowledgeHeader/                  # 页头：标题 + 统计 + 上传入口
│   │   ├── KnowledgeHeader.jsx
│   │   └── KnowledgeHeader.css
│   ├── TopicSidebar/                     # 左栏：话题标签云 + 统计卡片
│   │   ├── TopicSidebar.jsx
│   │   └── TopicSidebar.css
│   ├── RagSearch/                        # RAG 检索输入框（对标 SearchForm）
│   │   ├── RagSearch.jsx
│   │   └── RagSearch.css
│   ├── QaConversation/                   # 问答对话区（流式 + Markdown + 来源引用）
│   │   ├── QaConversation.jsx
│   │   └── QaConversation.css
│   ├── DocumentList/                     # 文档列表（核心内容展示组件）
│   │   ├── DocumentList.jsx
│   │   ├── DocumentList.css
│   │   └── data/
│   │       └── mockData.js               # 知识库 mock 数据统一存放于此（对标 ComprehensiveResults/data/mockData.js）
│   └── DocumentUploader/                 # 文档上传 Modal
│       ├── DocumentUploader.jsx
│       └── DocumentUploader.css
├── hooks/
│   └── useKnowledgeState.js              # 知识库状态管理（对标 useSearchState）
└── pages/
    └── KnowledgePage/
        └── KnowledgePage.jsx             # 页面容器：组装子组件（对标 SearchPage.jsx）
```

**mock 数据归属说明**：知识库 mock 数据（文档 / 话题 / 统计 / 推荐问题 / mock 回答）统一集中在 `DocumentList/data/mockData.js`。
理由：`DocumentList` 是知识库的核心内容展示组件（文档是知识库的核心持久化实体），对标搜索功能中 `ComprehensiveResults` 作为核心结果展示组件并承载 `mockData.js` 的做法。`KnowledgePage.jsx` 统一从该处 import mock 数据并向下传递，与 `SearchPage.jsx` 从 `ComprehensiveResults/data/mockData` import 的模式一致。

### 2.3 组件树

> **封装依据**：以下组件按「单一职责 / 内聚性」拆分，不刻意对齐搜索页的组件数量。每个组件承担一个清晰的交互职责，便于独立维护与测试。

```
KnowledgePage (pages/KnowledgePage/KnowledgePage.jsx)
├── KnowledgeHeader            # 职责：页面标题 + 概览统计 + 触发上传（控制 Modal 开合）
├── TopicSidebar               # 职责：话题标签云 + 统计卡片，提供按话题筛选能力
├── RagSearch                  # 职责：RAG 检索输入 + 推荐问题（输入与建议的内聚单元）
├── QaConversation             # 职责：多轮问答展示（流式渲染 + Markdown + 来源引用），复杂度高，独立
├── DocumentList               # 职责：文档列表（核心持久化实体展示 + 筛选/排序/删除）
└── DocumentUploader           # 职责：文档上传 Modal（受控弹窗，与列表解耦）
```

### 2.4 复用现有模式

- **状态管理**：参照 `useSearchState.js`，用 `useState` + 自定义 hook 管理知识库状态
- **流式问答**：复用 `utils/typewritter.js` 打字机效果与 SSE 流式读取逻辑
- **Markdown 渲染**：复用 `@streamdown` / `react-markdown` 渲染 AI 回答
- **样式变量**：复用 `index.css` 中的 CSS 变量（`--accent`、`--panel` 等）
- **组件导出**：参照 `components/index.js`，新增 `KnowledgeComponents` 导出组
- **页面抽取**：`App.jsx` 中 `{activeNav === '知识库' && <KnowledgePage />}`，与 `{activeNav === '智能检索' && <SearchPage />}` 完全对齐

---

## 三、核心功能设计

### 3.1 RAG 检索框

| 项 | 说明 |
|----|------|
| 输入 | 自然语言问题 |
| 触发 | 回车 / 点击「检索」按钮 |
| 行为 | 发起 SSE 流式请求到后端 `/knowledge/query`，实时渲染回答 |
| 示例 | 展示 3-5 个推荐问题，点击填入 |

请求/响应格式（与 `/search` 一致的 SSE 协议）：

```
POST /knowledge/query
{ "query": "上次团队讨论DeepSeek的结论是什么？" }

SSE data 行：
{ "message": "根据知识库...", "sources": [...], "is_final": true }
```

### 3.2 问答对话区（QaConversation）

- 以对话气泡形式展示多轮问答（user / assistant）
- assistant 消息支持 Markdown 流式渲染（含表格、代码、链接）
- 每条 AI 回答下方展示「来源引用」卡片：文档标题 + 相关度 + 跳转链接
- 支持上下文连续提问（保留对话历史）
- 滚动到底部自动跟随，参照 `ComprehensiveResults` 的滚动逻辑

### 3.3 文档上传（DocumentUploader）

- 触发方式：Header「上传文档」按钮 → 弹出 Modal
- 支持格式：PDF / Markdown / TXT（PRD 5.4.2）
- 交互：
  - 拖拽上传区 + 点击选择
  - 显示文件名、大小、上传进度
  - 上传时可填写话题标签（可多选 / 自定义）
  - 上传完成提示「入库成功，正在向量化」
- 接口：`POST /knowledge/upload`（multipart/form-data）

### 3.4 话题标签云（TopicSidebar）

- 展示热门话题，按文档数量排序
- 点击话题 → 筛选右侧文档列表
- 标签云支持「全部」选项重置筛选
- 统计卡片：文档总数、话题数、本周新增

### 3.5 文档列表（DocumentList）

- 卡片式列表，每项含：标题、摘要、来源、入库时间、话题标签
- 支持按话题筛选、按时间排序
- 操作：查看详情、删除、重新向量化
- 空状态：「暂无文档，请上传文档或从检索结果保存」

### 3.6 智能检索页 → 知识库 联动

改造 `SearchPage.jsx` 的 `handleSaveToKnowledge`：

- 当前为 `alert` 占位，改造为弹出确认 Modal
- Modal 内容：确认保存的标题、可编辑话题标签、来源信息
- 确认后调用 `POST /knowledge/save`，将检索结果（标题/摘要/来源链接/原始查询）入库
- 保存成功后 Toast 提示「已保存到知识库，可前往知识库查看」

接口设计：

```
POST /knowledge/save
{
  "title": "...",
  "content": "...",
  "source": "...",
  "source_url": "...",
  "tags": ["大模型", "融资"],
  "original_query": "..."
}
```

---

## 四、状态管理设计（useKnowledgeState）

```js
// 核心状态
const [query, setQuery] = useState('')              // RAG 检索输入
const [conversations, setConversations] = useState([]) // 问答历史 [{role, content, sources}]
const [isQuerying, setIsQuerying] = useState(false) // 是否正在检索
const [documents, setDocuments] = useState([])      // 文档列表
const [topics, setTopics] = useState([])            // 话题列表 [{name, count}]
const [selectedTopic, setSelectedTopic] = useState(null) // 当前筛选话题
const [stats, setStats] = useState({ totalDocs, totalTopics, weeklyNew }) // 统计

// 核心方法
executeRagQuery()    // 发起 RAG 检索（SSE 流式）
uploadDocument(file, tags)  // 上传文档
saveToKnowledge(payload)    // 保存检索结果到知识库
deleteDocument(id)          // 删除文档
filterByTopic(topic)        // 按话题筛选
```

---

## 五、接口约定（前端视角）

| 接口 | 方法 | 说明 | 状态 |
|------|------|------|------|
| `/knowledge/query` | POST | RAG 检索问答（SSE 流式） | 待后端实现，前端先用 mock |
| `/knowledge/upload` | POST | 文档上传 | 待后端实现，前端先用 mock |
| `/knowledge/save` | POST | 检索结果入库 | 待后端实现，前端先用 mock |
| `/knowledge/documents` | GET | 文档列表 | 待后端实现，前端先用 mock |
| `/knowledge/topics` | GET | 话题列表 | 待后端实现，前端先用 mock |
| `/knowledge/documents/:id` | DELETE | 删除文档 | 待后端实现，前端先用 mock |

> **注**：后端接口尚未实现，前端先用 mock 数据跑通流程，接口就绪后切换为真实请求（参照 `useSearchState` 中 `fetch('/search')` 的模式）。

---

## 六、样式规范

- 复用 `index.css` 中定义的 CSS 变量与类名（`primary-btn`、`secondary-btn`、`chip`、`panel` 等）
- 新增类名命名空间：`knowledge-*`（如 `knowledge-panel`、`knowledge-search`）
- 卡片圆角 `16px`，边框 `1px solid var(--line)`
- 标签云使用 `chip` 样式变体
- 响应式：768px 以下三栏退化为单栏

---

## 七、实施步骤

> 按现有代码库的目录约定平铺创建，不新增嵌套目录。

1. **创建 mock 数据**：`components/DocumentList/data/mockData.js`（文档 / 话题 / 统计 / 推荐问题 / mock 回答）
2. **实现状态 hook**：`hooks/useKnowledgeState.js`（初始化读取 mock 数据，封装 RAG 检索 / 上传 / 入库 / 删除 / 筛选）
3. **开发子组件**（每个 `组件名/组件名.jsx` + `.css`，并登记到 `components/index.js` 的 `KnowledgeComponents`）：
   - `KnowledgeHeader` / `TopicSidebar` / `RagSearch` / `QaConversation` / `DocumentList` / `DocumentUploader`
4. **组装页面**：`pages/KnowledgePage/KnowledgePage.jsx`（import hook + mock 数据 + `KnowledgeComponents`，组装三栏布局）
5. **接入 App.jsx**：删除 `App.jsx` 中内联的「知识库」JSX，改为 `{activeNav === '知识库' && <KnowledgePage />}`，并补 import
6. **检索页联动**：改造 `SearchPage.jsx` 的 `handleSaveToKnowledge`，弹出 `DocumentUploader` 复用的确认 Modal（标题可编辑 + 话题标签 + 来源信息），确认后调用 `saveToKnowledge`（mock）
7. **更新任务文档**：`docs/frontend-development-tasks.md` 任务 #4 状态 → 🔄 进行中 / ✅ 已完成
8. **本地验证**：页面交互、样式一致性、响应式

---

## 八、验收标准

- [ ] 目录结构与现有代码库一致：组件平铺于 `src/components/`、hook 在 `src/hooks/`、页面仅 `src/pages/KnowledgePage/KnowledgePage.jsx`
- [ ] `App.jsx` 中知识库内容已抽取为 `<KnowledgePage />`，与 `<SearchPage />` 用法对齐
- [ ] `components/index.js` 新增 `KnowledgeComponents` 导出组
- [ ] 知识库页面布局完整，三栏结构清晰
- [ ] RAG 检索框可输入并触发（mock 流式回答）
- [ ] 问答对话区正确渲染 Markdown 与来源引用
- [ ] 文档上传 Modal 可打开、选择文件、显示进度（mock）
- [ ] 话题标签云可点击筛选文档列表
- [ ] 文档列表按话题筛选、按时间展示
- [ ] 智能检索页「保存到知识库」弹出确认 Modal 并保存（mock）
- [ ] 样式与现有页面风格一致，响应式正常
