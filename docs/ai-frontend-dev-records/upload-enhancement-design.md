# 文档上传增强设计方案：AI 自动提取 + 批量上传

> **文档版本**: v1.0  
> **创建日期**: 2026-08-04  
> **负责人**: 前端开发团队  
> **关联任务**: 前端开发任务 #4 知识库页面开发  
> **关联文档**: `knowledge-base-design.md` §3.3 文档上传（DocumentUploader）

---

## 一、设计目标

在知识库「文档上传」功能基础上，新增两项能力：

1. **AI 自动提取**：用户选择文件后，自动调用 AI 提取标题、摘要、话题标签，结果可编辑，减少手工填写成本。
2. **批量上传**：支持一次性选择/拖拽多个文件，单次最多 10 个，逐项独立提取与上传。

> **约束**：仅修改前端代码，后端接口未就绪，所有 AI 提取与上传逻辑先用 mock 跑通流程，接口就绪后切换为真实请求（参照 `useSearchState` 中 `fetch('/search')` 的模式）。

---

## 二、改动范围

| 文件 | 改动内容 |
|------|---------|
| `frontend/src/hooks/useKnowledgeState.js` | 新增 `extractDocumentMeta(file)` mock + `uploadDocuments(fileItems)` 批量上传 + `isExtracting` 状态 |
| `frontend/src/components/DocumentUploader/DocumentUploader.jsx` | 单文件 → 文件列表；每项独立 AI 提取；10 条上限校验；新增摘要 textarea |
| `frontend/src/components/DocumentUploader/DocumentUploader.css` | 文件列表项、提取加载态、摘要 textarea、批量进度、重新提取按钮样式 |
| `frontend/src/pages/KnowledgePage/components/DocumentList/data/mockData.js` | 新增 `mockExtractResult` 提取结果模板 |
| `frontend/src/pages/KnowledgePage/KnowledgePage.jsx` | 透传新增的 `extractDocumentMeta` / `isExtracting` / `uploadDocuments` props |

> **不改动**：`SearchPage.jsx`（使用 `mode='save'`，无文件选择，走原 `onSave` 单条逻辑，不受影响）

---

## 三、数据模型

### 3.1 文件项结构（核心变化）

单文件时只有一个 `file`。批量改为**文件项数组**，每项独立管理提取状态与提取结果：

```js
// 每个文件项的结构
{
  id: string,            // 唯一 key（file.name + 时间戳）
  file: File,            // 原始文件对象
  status: 'extracting' | 'done' | 'error',  // 提取状态
  title: string,         // AI 提取标题（可编辑）
  summary: string,       // AI 提取摘要（可编辑）
  tags: string,          // AI 提取标签（逗号分隔，可编辑）
  error: string          // 提取失败信息（仅 error 态）
}
```

### 3.2 常量

```js
export const MAX_UPLOAD_COUNT = 10  // 单次批量上传上限
```

---

## 四、交互流程

### 4.1 整体流程

```
选择/拖拽文件（可多选）
       │
       ▼
 校验数量 ──→ 合并已有 + 新选，超过 10 → 截断至 10 + Toast「最多上传 10 个文件，已自动截取前 10 个」
       │
       ▼
 逐个加入文件列表 ──→ 每项自动触发 AI 提取（并发，各自独立加载态）
       │
       ▼
 提取完成 ──→ 标题/摘要/标签自动填入（均可逐项编辑）
       │
       ▼
 用户可：编辑提取结果 / 删除单项 / 继续追加文件（总数仍 ≤ 10）
       │
       ▼
 点击「上传入库」 ──→ 逐个上传，显示整体进度（已完成 n/总数）
       │
       ▼
 全部完成 ──→ 关闭 Modal
```

### 4.2 关键设计点

#### 10 条上限的执行位置

- **文件选择时**：合并已有 + 新选，超过 10 截断并提示
- **拖拽时**：同上逻辑
- **继续追加**：列表未满 10 时允许继续选择，已满则禁用「添加文件」入口

#### 部分提取失败

- 允许用户跳过失败项、仅上传成功项
- 失败项可点击「重新提取」重试，也可手动填写后一起提交

#### AI 提取（mock）

- **TXT/MD**：用 `FileReader` 读取真实内容 → 首行作标题、首段作摘要、按关键词命中 mock 话题库
- **PDF**：前端无法解析 → 返回 `mockExtractResult` 模板，标题标注「（AI 提取）」前缀
- 多文件**并发提取**（互不阻塞）

---

## 五、界面设计

### 5.1 文件列表 UI（替代原单文件展示）

```
┌─────────────────────────────────────────────┐
│  ⬆️ 拖拽文件到此处，或点击选择（还可添加 N 个）   │
│  支持 PDF / Markdown / TXT · 最多 10 个        │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│ 📄 report.pdf          120 KB        ✕ 删除   │
│ ┌───────────────────────────────────────┐   │
│ │ 标题  [AI 已提取] Q3 财报分析__________  │   │
│ │ 摘要  [textarea] 本季度营收同比增长...    │   │
│ │ 标签  [大模型, 融资]__________________  │   │
│ └───────────────────────────────────────┘   │
├─────────────────────────────────────────────┤
│ 📄 notes.md            8 KB          ✕ 删除   │
│ ⟳ AI 正在解析文档...                          │
├─────────────────────────────────────────────┤
│ 📄 error.txt           5 KB          ✕ 删除   │
│ ⚠ 提取失败 [重新提取]                          │
└─────────────────────────────────────────────┘
```

### 5.2 文件项三种行状态

| 状态 | 展示 |
|------|------|
| `extracting` | spinner 动画 + 「AI 正在解析文档...」 |
| `done` | 可编辑表单（标题 input + 摘要 textarea + 标签 input），标题旁标「AI 已提取」 |
| `error` | 失败提示 + 「重新提取」按钮，用户也可手动填写后提交 |

### 5.3 批量上传进度

```
入库中... 3/5
██████████░░░░░░░░░░  60%
```

整体进度 = 已完成数 / 总数，逐个 mock 入库。

---

## 六、接口约定（前端视角）

### 6.1 AI 提取（mock，后端就绪后切换）

```
POST /knowledge/extract
FormData: { file }
Response: { title, summary, tags: [] }
```

前端 mock 实现：
- TXT/MD：`FileReader` 读取真实内容生成
- PDF：返回 `mockExtractResult.pdf` 模板

### 6.2 批量上传（mock，后端就绪后切换）

```
POST /knowledge/upload
FormData: { files[], titles[], summaries[], tags[] }
Response: { success: true }
```

前端 mock：逐个入库，更新进度。

> **注**：后端接口尚未实现，前端先用 mock 数据跑通流程，接口就绪后切换为真实请求。

---

## 七、状态管理设计（useKnowledgeState）

```js
// 新增状态
const [isExtracting, setIsExtracting] = useState(false)

// 新增方法：AI 提取文档元信息（mock）
const extractDocumentMeta = async (file) => {
  setIsExtracting(true)
  // TXT/MD：FileReader 读取真实内容
  // PDF：返回 mockExtractResult 模板
  // 返回 { title, summary, tags }
  setIsExtracting(false)
  return { title, summary, tags }
}

// 改造方法：批量上传（替代原单条 uploadDocument）
const uploadDocuments = async (fileItems) => {
  setIsUploading(true)
  setUploadProgress(0)
  for (let i = 0; i < fileItems.length; i++) {
    const item = fileItems[i]
    const newDoc = {
      id: `doc-${Date.now()}-${i}`,
      title: item.title || item.file.name.replace(/\.[^.]+$/, ''),
      summary: item.summary || '',
      source: '文档上传',
      sourceUrl: '',
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      tags: parseTags(item.tags)
    }
    setDocuments((prev) => [newDoc, ...prev])
    setUploadProgress(Math.round(((i + 1) / fileItems.length) * 100))
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  setIsUploading(false)
  setUploadProgress(0)
  return true
}
```

> **兼容**：保留 `uploadDocument(file, tags)` 单条方法供其他可能调用处使用（内部转调 `uploadDocuments`）。

---

## 八、兼容性

- **`mode='save'`（检索结果入库）完全不受影响**：无文件选择，走原 `onSave` 逻辑，保持单条
- **`KnowledgePage.jsx`**：补透传 `extractDocumentMeta` / `isExtracting` / `uploadDocuments`
- **`SearchPage.jsx`**：不受影响（用 `mode='save'`）

---

## 九、实施步骤

1. **更新 mock 数据**：`mockData.js` 新增 `mockExtractResult`（按文件类型）
2. **扩展状态 hook**：`useKnowledgeState.js` 新增 `extractDocumentMeta` / `uploadDocuments` / `isExtracting`
3. **改造上传组件**：`DocumentUploader.jsx` 单文件 → 文件列表 + 10 上限 + 逐项 AI 提取 + 摘要 textarea
4. **补样式**：`DocumentUploader.css` 新增列表项、提取态、摘要、批量进度样式
5. **透传 props**：`KnowledgePage.jsx` 把新增方法/状态传给 `DocumentUploader`
6. **本地验证**：多文件选择、10 上限截断、提取加载/成功/失败、编辑、批量上传进度、`mode='save'` 回归

---

## 十、验收标准

- [ ] 支持多文件选择/拖拽，文件项列表正确展示
- [ ] 文件数量超过 10 时自动截断至 10 并提示
- [ ] 列表未满 10 时可继续追加文件，已满则禁用添加入口
- [ ] 每个文件项选择后自动触发 AI 提取（mock），显示加载态
- [ ] 提取完成后标题/摘要/标签自动填入，均可逐项编辑
- [ ] 提取失败项显示提示 + 「重新提取」按钮，可重试或手动填写
- [ ] 摘要字段以 textarea 展示（原表单无此字段）
- [ ] 点击「上传入库」逐个上传，显示整体进度（n/总数 + 进度条）
- [ ] 上传完成后 Modal 关闭，文档列表新增对应条目
- [ ] `mode='save'`（检索结果入库）功能回归正常，不受影响
- [ ] 样式与现有页面风格一致
