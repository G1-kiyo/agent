# Vite + React 前端开发规范（AI 开发提示词）

> 本文档是面向 AI 编程助手的开发规范。开发或修改前端代码前，请先通读本文档并严格遵守。
> 项目采用 **Vite + React + MPA（多页面应用）** 架构，非 SPA。

---

## 一、技术栈

| 项目 | 说明 |
|------|------|
| 构建工具 | Vite 4 |
| 框架 | React 18 |
| MPA 方案 | `vite-plugin-virtual-mpa`（单模板 + 虚拟多页面） |
| 语言 | JavaScript（JSX），暂未用 TypeScript |
| 样式 | 原生 CSS（按页面就近组织，非 CSS-in-JS） |

---

## 二、核心架构：MPA（多页面应用）

本项目是 **MPA**，不是 SPA，**不要使用 react-router 等客户端路由库**。

- 每个页面是**独立的 HTML 文档 + 独立的 JS 入口**，页面间通过原生 `<a href>` 跳转，整页刷新。
- 5 个页面共用**一份** `index.html` 模板，由 `vite-plugin-virtual-mpa` 在 dev/build 时按 `vite.config.js` 的 `pages` 配置自动生成各页面入口。
- 模板内用 EJS 占位符 `<%= title %>` 注入页面标题。
- 所有页面共用 `AppLayout`（侧边栏 + 顶部栏外壳），各入口把页面内容作为 `children` 传入。

### 入口文件统一写法

```jsx
// src/entries/<page>.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppLayout } from '../layouts/AppLayout'
import { XxxPage } from '../pages/XxxPage/XxxPage'
import '../styles/index.css'
import '../styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppLayout navKey="xxx">
      <XxxPage />
    </AppLayout>
  </React.StrictMode>,
)
```

**注意：** 每个入口必须导入 `../styles/index.css`（全局基础样式）和 `../styles/global.css`（全局补充样式）。页面专属样式由页面组件自己导入，入口不要重复导入。

---

## 三、目录结构（必须遵守）

```
frontend/
├── index.html                 # 唯一的 HTML 模板（EJS 占位符，不要创建其它 HTML）
├── vite.config.js             # MPA pages 配置（单处管理所有页面）
├── package.json
└── src/
    ├── entries/               # 每个页面的 JS 入口（一一对应，勿放根目录）
    │   ├── home.jsx
    │   ├── search.jsx
    │   ├── discussion.jsx
    │   ├── knowledge.jsx
    │   └── admin.jsx
    ├── pages/                 # 每个页面一个目录（禁止平铺文件）
    │   ├── HomePage/
    │   │   ├── HomePage.jsx
    │   │   └── HomePage.css
    │   ├── SearchPage/
    │   │   ├── SearchPage.jsx
    │   │   ├── SearchPage.css
    │   │   ├── components/    # 页面专属组件
    │   │   │   ├── index.js
    │   │   │   ├── SearchForm/
    │   │   │   │   ├── SearchForm.jsx
    │   │   │   │   └── SearchForm.css
    │   │   │   └── ...
    │   │   └── hooks/         # 页面专属 hooks（单一职责，仅服务本页）
    │   │       ├── index.js
    │   │       ├── useSearchExecution.js
    │   │       └── useCheckpoints.js
    │   └── ...
    ├── components/            # 跨页面复用的通用组件（非页面专属）
    │   ├── index.js
    │   └── DocumentUploader/
    │       ├── DocumentUploader.jsx
    │       └── DocumentUploader.css
    ├── layouts/               # 布局组件
    │   └── AppLayout.jsx      # 共享外壳（侧边栏 + 顶部栏）
    ├── config/                # 配置（导航等）
    │   └── nav.jsx
    ├── hooks/                 # 通用 hooks（跨页面复用，单一职责）
    │   ├── index.js           # 聚合导出通用 hooks
    │   └── common/
    │       ├── useTypewriter.js   # 打字机流式输出
    │       └── useSSEStream.js    # 通用 SSE 流式读取
    ├── consts/                # 常量
    ├── utils/                 # 工具函数
    └── styles/                # 全局样式
        ├── index.css          # 全局基础（变量、重置、AppLayout 外壳、通用按钮/动画）
        └── global.css         # 全局补充（动画、响应式）
```

### 结构关键约定

1. **页面必须以目录形式存在**，`pages/` 下不允许平铺 `.jsx`/`.css` 文件。
2. **入口统一放 `src/entries/`**，不要在 `src/` 根目录创建 `main.jsx`/`App.jsx`。
3. **HTML 只保留一份 `index.html` 模板**，不要为每个页面创建独立 HTML。
4. **组件就近放置**：页面专属组件放 `pages/<Page>/components/`，跨页面复用组件放 `src/components/`。
5. **组件目录 = 组件同名**，内部含同名 `.jsx` + `.css`，例如 `SearchForm/SearchForm.jsx` + `SearchForm/SearchForm.css`。
6. **hooks 就近放置且单一职责**：
   - 通用 hooks（被 ≥2 个页面复用，或与具体页面无关）放 `src/hooks/common/`。
   - 页面专属 hooks（只服务某个页面）放 `pages/<Page>/hooks/`。
   - 判断不准时，先放页面下；出现复用需求再提升为通用 hook。
   - 每个 hook 只做一件事；若一个 hook 同时管理「对话 + 列表 + 上传」等多类状态，应拆成多个单一职责 hook，由页面组合使用。
   - hooks 目录下用 `index.js` 聚合导出，形成 hooks 组便于批量导入。

---

## 四、新增页面流程（重要）

新增一个页面时，按以下步骤操作，**不要遗漏任何一步**：

1. **创建页面目录与文件**
   ```
   src/pages/NewPage/
     ├── NewPage.jsx
     └── NewPage.css
   ```
   - `NewPage.jsx` 顶部 `import './NewPage.css'`。
   - 页面根元素用语义化的 `<section className="new-page-panel">`。

2. **创建入口文件**
   ```
   src/entries/newpage.jsx
   ```
   参照「入口文件统一写法」，`navKey` 用页面的 key。

3. **在 `vite.config.js` 的 `pages` 数组中注册**
   ```js
   {
     name: 'newpage',
     entry: '/src/entries/newpage.jsx',
     data: { title: '新页面' },
   },
   ```
   - `name` 不可包含 `/`。
   - `entry` 必须以 `/` 开头（项目根相对路径）。
   - 首页固定 `filename: 'index.html'`，其余页面默认生成 `${name}.html`，无需写 `filename`。

4. **在 `src/config/nav.jsx` 的 `NAV_ITEMS` 中添加导航项**
   ```js
   {
     key: 'newpage',
     label: '新页面',
     href: './newpage.html',
     title: '新页面',
     subtitle: '页面副标题',
   },
   ```

5. **验证**：运行 `npm run build`，确认 `dist/newpage.html` 生成且标题正确。

---

## 五、CSS 规范

### 分层原则

| 层级 | 位置 | 内容 | 导入方式 |
|------|------|------|----------|
| 全局基础 | `src/styles/index.css` | CSS 变量、重置、`AppLayout` 外壳、通用按钮/控件/动画、外壳响应式 | 每个入口导入 |
| 全局补充 | `src/styles/global.css` | 跨页面动画、响应式补充 | 每个入口导入 |
| 页面样式 | `pages/<Page>/<Page>.css` | 该页面专属的容器与布局样式 | 页面组件 `import './XxxPage.css'` |
| 组件样式 | `pages/<Page>/components/<Comp>/<Comp>.css` 或 `components/<Comp>/<Comp>.css` | 组件专属样式 | 组件 `import './Xxx.css'` |

### 禁止事项

- ❌ **禁止把页面专属样式写进 `src/styles/index.css`**。`search-*`、`discussion-*`、`admin-*`、`knowledge-*`、`hero-*` 等只属于某个页面。
- ❌ **禁止把页面专属组件写进 `src/components/`**。只在一个页面用的组件放该页面的 `components/` 下。
- ❌ **禁止重复定义**。若 `index.css` 已定义某类（如 `.app-shell`），页面 CSS 不要再重复。
- ❌ **禁止 CSS-in-JS**，统一用 `.css` 文件。

### CSS 变量（统一使用，勿硬编码颜色）

```css
--bg, --panel, --panel-2, --line, --text, --muted, --accent, --accent-2, --success
```

---

## 六、组件规范

### 导出方式

- 组件统一用具名导出 `export const Xxx = () => {}`，同时附带 `export default Xxx`。
- 组件目录下用 `index.js` 聚合导出，形成组件组便于批量导入：
  ```js
  // pages/SearchPage/components/index.js
  import { SearchForm } from './SearchForm/SearchForm'
  export const SearchComponents = { SearchForm, /* ... */ }
  ```

### 通用组件 vs 页面组件

- **通用组件**（`src/components/`）：被 ≥2 个页面使用，或与具体页面无关（如 `DocumentUploader`）。
- **页面组件**（`pages/<Page>/components/`）：只服务于某个页面。
- 判断不准时，先放页面下；出现复用需求再提升为通用组件。

### 组件命名

- 目录与文件用 **PascalCase**：`SearchForm/SearchForm.jsx`。
- className 用 **kebab-case**：`search-form`、`result-item`。
- 页面组件根 className 约定：`<page>-panel`，如 `search-panel`、`knowledge-panel`。

---

## 七、共享布局 AppLayout

所有页面入口统一包裹 `<AppLayout navKey="xxx">`，它提供：

- 侧边栏（导航来自 `config/nav.jsx`，自动高亮当前 `navKey`）
- 顶部栏（标题/副标题来自导航配置）
- `{children}` 即页面内容

**不要在页面组件内部重复实现侧边栏/顶部栏**，那是 AppLayout 的职责。页面组件只负责 `<main>` 区域内容。

---

## 八、代码规范

1. **函数组件 + Hooks**，不使用 class 组件。
2. **状态管理**：局部状态用 `useState`；跨页面无共享状态（MPA 各页面独立挂载）。复杂页面状态抽到 hooks：
   - 通用 hooks 放 `src/hooks/common/`，页面专属 hooks 放 `pages/<Page>/hooks/`。
   - 每个 hook 遵循**单一职责**：一个 hook 只管一类状态（如对话、列表、上传分开），由页面组合多个 hook。
   - hooks 间通过回调解耦（如上传 hook 通过 `onUploaded` 回调把结果交还列表 hook），避免互相直接持有 setter。
3. **导入顺序**：React → 第三方库 → 本地模块（layouts/components/hooks）→ 样式。
4. **注释**：文件顶部说明用途；MPA 相关文件注明对应页面。中文注释。
5. **不引入 react-router**——本项目靠浏览器原生导航，不用客户端路由。
6. **构建验证**：改完跑 `npm run build`，确认无报错且各 `dist/*.html` 标题正确。

---

## 九、AI 开发自检清单

提交修改前，逐项确认：

- [ ] 新增页面是否同时完成：页面目录 + 入口文件 + `vite.config.js` 注册 + `nav.jsx` 导航项？
- [ ] `pages/` 下有没有平铺文件？（应为 0）
- [ ] `src/` 根目录有没有 `main.jsx`/`App.jsx`？（应为 0）
- [ ] 是否创建了多余的 HTML 文件？（只应有一份 `index.html`）
- [ ] 页面专属样式是否误写进 `src/styles/index.css`？
- [ ] 页面专属组件是否误放 `src/components/`？
- [ ] 页面专属 hook 是否误放 `src/hooks/`（应放 `pages/<Page>/hooks/`）？通用 hook 是否误放页面下？
- [ ] 是否有 hook 一个干多件事（如同时管理对话+列表+上传）？应拆成多个单一职责 hook。
- [ ] 入口是否同时导入了 `index.css` 和 `global.css`？
- [ ] `npm run build` 是否通过，`dist/*.html` 标题是否正确？

## 九、API 规范

### API 架构原则

1. **统一入口**：所有 API 请求必须通过 `@/api` 模块导入，禁止直接使用 `fetch` 或 `axios`
2. **自动认证**：Token 会自动添加到请求头，自动处理过期刷新
3. **全局控制**：统一的 Loading 和 Alert 控制，可通过配置关闭
4. **错误处理**：统一的错误处理机制，业务失败自动显示错误提示

### API 设计规范

#### 1. API 文件结构
```
src/api/
├── index.js          # 统一导出
├── request.js        # 核心请求封装
├── auth.js          # 认证相关 API
├── user.js          # 用户管理 API
├── knowledge.js     # 知识库 API
├── search.js        # 搜索 API
└── ...              # 其他业务 API
```

#### 2. API 命名规范

- **模块级**：使用驼峰命名，如 `userApi`、`knowledgeApi`
- **接口级**：使用动词+名词，如 `getUserList`、`createUser`
- **HTTP 方法映射**：
  - GET：`getXxx`、`getXxxDetail`
  - POST：`createXxx`、`uploadXxx`
  - PUT：`updateXxx`
  - DELETE：`deleteXxx`

#### 3. API 返回格式规范

```javascript
// 成功响应
{
  code: 200,           // 状态码
  data: {},            // 业务数据
  msg: "success"       // 提示信息
}

// 失败响应
{
  code: 400,           // 错误码
  data: null,          // 空数据
  msg: "参数错误"      // 错误信息
}
```

#### 4. API 使用规范

```javascript
// ✅ 推荐用法
import { userApi } from '@/api'

// 获取用户列表
const users = await userApi.getUserList({ page: 1, limit: 10 })

// 创建用户
const result = await userApi.createUser({ name: 'John', email: 'john@example.com' })

// ❌ 禁止用法
import { request } from '@/api'
const result = await request('/user/create', {
  method: 'POST',
  body: JSON.stringify({ name: 'John' })
})
```

#### 5. API 错误处理

```javascript
// 1. 基本错误处理（自动显示错误提示）
try {
  const result = await userApi.createUser(userData)
  // 成功处理
} catch (error) {
  // 错误已自动显示，这里只处理业务逻辑
}

// 2. 自定义错误处理
try {
  const result = await userApi.createUser(userData, {
    needAlert: false  // 关闭自动错误提示
  })
  // 成功处理
} catch (error) {
  // 自定义错误处理
  if (error.message === '用户已存在') {
    // 特殊处理
  }
}
```

#### 6. API 请求配置

```javascript
// 基本配置
const result = await userApi.getUserList(params, {
  needLoading: true,    // 显示 loading
  needAlert: true,      // 显示错误提示
  needOrigin: false     // 返回原始响应
})

// 数据类型配置
const streamResponse = await api.getData(null, {
  dataType: 'STREAM'    // 流式响应
})
```

#### 7. API 文档规范

每个 API 文件必须包含完整的 JSDoc 注释：

```javascript
/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.keyword - 搜索关键词
 * @returns {Promise<Object>} 用户列表数据
 */
getUserList: async (params) => {
  const response = await request('/users', {
    method: 'GET',
    body: JSON.stringify(params)
  })
  return response
}
```

#### 8. API 测试规范

- **单元测试**：每个 API 必须有对应的单元测试
- **Mock 数据**：开发阶段使用 Mock 数据
- **错误场景**：测试各种错误场景（网络错误、服务器错误、参数错误等）

### 十、React Hook 规范

#### 1. Hook 使用基本原则

1. **只在顶层调用 Hook**：禁止在循环、条件语句或嵌套函数中调用 Hook
2. **只在 React 函数中调用 Hook**：禁止在普通 JavaScript 函数中调用 Hook
3. **自定义 Hook 命名必须以 `use` 开头**：便于 ESLint 检查
4. **Hook 顺序一致性**：确保每次渲染时 Hook 调用顺序一致

#### 2. 禁止的 Hook 使用方式

```javascript
// ❌ 禁止：在条件语句中使用 Hook
if (someCondition) {
  const [state, setState] = useState('')
}

// ❌ 禁止：在循环中使用 Hook
for (let i = 0; i < items.length; i++) {
  const [item, setItem] = useState(items[i])
}

// ❌ 禁止：在嵌套组件中使用相同的 Hook
function ParentComponent() {
  const [data, setData] = useState([])
  
  function ChildComponent() {
    // 错误：在子组件中使用与父组件相同的 Hook
    const [data, setData] = useState([])
    // ...
  }
  
  return <ChildComponent />
}
```

#### 3. Hook 最佳实践

```javascript
// ✅ 正确：在顶层使用 Hook
function MyComponent() {
  const [state, setState] = useState('')
  const ref = useRef(null)
  
  // Hook 调用顺序保持一致
  useEffect(() => {
    // ...
  }, [state])
  
  // ...
}

// ✅ 正确：提取自定义 Hook
function useDataLoader(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    setLoading(true)
    fetchData(url).then(result => {
      setData(result)
      setLoading(false)
    })
  }, [url])
  
  return { data, loading }
}

// ✅ 正确：在组件中使用自定义 Hook
function MyComponent() {
  const { data, loading } = useDataLoader('/api/data')
  
  if (loading) return <div>Loading...</div>
  return <div>{data}</div>
}
```

#### 4. Hook 依赖管理

```javascript
// ✅ 正确：明确指定依赖
useEffect(() => {
  fetch('/api/data').then(response => setData(response))
}, [someDependency])  // 明确依赖

// ✅ 正确：使用 useCallback 缓存函数
const fetchData = useCallback(async () => {
  const response = await fetch('/api/data')
  setData(response)
}, [someDependency])

// ❌ 禁止：依赖不完整
useEffect(() => {
  fetch('/api/data').then(response => setData(response))
}, [])  // 缺少依赖

// ❌ 禁止：无限循环
const [count, setCount] = useState(0)
useEffect(() => {
  setCount(count + 1)  // 会无限循环
}, [count])
```

#### 5. 性能优化 Hook

```javascript
// ✅ 正确：使用 useMemo 优化计算
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(props.data)
}, [props.data])

// ✅ 正确：使用 useCallback 优化函数传递
const handleButtonClick = useCallback(() => {
  // 处理点击事件
}, [someDependency])

// ❌ 禁止：不必要的重新计算
function MyComponent({ data }) {
  const expensiveValue = computeExpensiveValue(data)  // 每次渲染都重新计算
  
  return <div>{expensiveValue}</div>
}
```

#### 6. Hook 文档规范

每个自定义 Hook 必须包含完整的文档：

```javascript
/**
 * 自定义 Hook：数据加载器
 * @param {string} url - API 接口地址
 * @param {Object} options - 配置选项
 * @param {boolean} options.autoLoad - 是否自动加载
 * @returns {Object} 返回数据、加载状态和错误信息
 * @example
 * const { data, loading, error } = useDataLoader('/api/data', {
 *   autoLoad: true
 * })
 */
function useDataLoader(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // 实现细节
  // ...
  
  return { data, loading, error }
}
```

## ⚠️ 注意事项

1. **推荐用法**：所有代码都应该从 `@/api` 导入
2. **Token 自动管理**：请求会自动添加 token，token 过期会自动刷新
3. **Loading/Alert**：默认显示 loading 和 alert，可通过配置关闭
4. **错误处理**：统一错误处理，业务失败会自动显示错误提示
5. **Hook 使用规范**：
   - 只在顶层调用 Hook
   - 不在嵌套组件中使用相同的 Hook
   - 保持 Hook 调用顺序一致
   - 正确管理依赖关系
6. **性能优化**：合理使用 useMemo 和 useCallback 避免不必要的重新渲染
