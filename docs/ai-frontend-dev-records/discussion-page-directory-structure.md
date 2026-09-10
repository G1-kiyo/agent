# DiscussionPage 重构目录结构文档

## 项目概述

本文档详细说明DiscussionPage重构后的目录结构，遵循项目的MPA架构和开发规范。

## 目录结构总览

```
frontend/
├── src/
│   ├── entries/
│   │   ├── discussion.jsx              # DiscussionPage入口文件
│   │   └── ...
│   ├── pages/
│   │   ├── DiscussionPage/           # DiscussionPage页面目录
│   │   │   ├── DiscussionPage.jsx    # 主页面组件
│   │   │   ├── DiscussionPage.css    # 页面全局样式（包含CSS变量系统）
│   │   │   ├── README.md             # 页面说明文档
│   │   │   ├── mockData.js           # 模拟数据
│   │   │   ├── test-components.js    # 测试组件
│   │   │   ├── hooks/                # 页面专属hooks
│   │   │   │   ├── index.js          # hooks导出聚合
│   │   │   │   ├── useDiscussionState.js
│   │   │   │   ├── useMessages.js
│   │   │   │   ├── useVoting.js
│   │   │   │   ├── useForkDiscussion.js
│   │   │   │   └── useCreateDiscussion.js
│   │   │   └── components/           # 页面专属组件
│   │   │       ├── index.js          # 组件导出聚合
│   │   │       ├── DiscussionPage/   # 主容器组件（双栏布局）
│   │   │       │   ├── DiscussionPage.jsx
│   │   │       │   └── styles/
│   │   │       │       └── DiscussionPage.module.css
│   │   │       ├── DiscussionHeader/ # 讨论头部组件
│   │   │       │   ├── DiscussionHeader.jsx
│   │   │       │   └── styles/
│   │   │       │       └── DiscussionHeader.module.css
│   │   │       ├── MessageList/      # 消息列表组件
│   │   │       │   ├── MessageList.jsx
│   │   │       │   └── styles/
│   │   │       │       └── MessageList.module.css
│   │   │       ├── MessageInput/     # 消息输入组件
│   │   │       │   ├── MessageInput.jsx
│   │   │       │   └── styles/
│   │   │       │       └── MessageInput.module.css
│   │   │       ├── HistoricalTopics/ # 历史话题组件
│   │   │       │   ├── HistoricalTopics.jsx
│   │   │       │   └── styles/
│   │   │       │       └── HistoricalTopics.module.css
│   │   │       ├── AIDebateGenerator/ # AI辩论生成器组件
│   │   │       │   ├── AIDebateGenerator.jsx
│   │   │       │   └── styles/
│   │   │       │       └── AIDebateGenerator.module.css
│   │   │       ├── QuickActions/     # 快速操作组件
│   │   │       │   ├── QuickActions.jsx
│   │   │       │   └── styles/
│   │   │       │       └── QuickActions.module.css
│   │   │       ├── UserHistory/      # 用户历史组件
│   │   │       │   ├── UserHistory.jsx
│   │   │       │   └── styles/
│   │   │       │       └── UserHistory.module.css
│   │   │       ├── DiscussionActions/ # 讨论操作组件（保留原有）
│   │   │       │   ├── DiscussionActions.jsx
│   │   │       │   └── DiscussionActions.css
│   │   │       ├── DiscussionThread/ # 讨论线程组件（保留原有）
│   │   │       │   ├── DiscussionThread.jsx
│   │   │       │   └── DiscussionThread.css
│   │   │       ├── MessageItem/      # 消息项组件（保留原有）
│   │   │       │   ├── MessageItem.jsx
│   │   │       │   └── MessageItem.css
│   │   │       ├── VotingSystem/     # 投票系统组件（保留原有）
│   │   │       │   ├── VotingSystem.jsx
│   │   │       │   └── VotingSystem.css
│   │   │       └── ForkDialog/       # 分支对话框组件（保留原有）
│   │   │           ├── ForkDialog.jsx
│   │   │           └── ForkDialog.css
│   │   ├── HomePage/
│   │   ├── SearchPage/
│   │   ├── KnowledgePage/
│   │   └── AdminPage/
│   ├── components/                   # 跨页面复用组件
│   │   ├── index.js
│   │   ├── AuthModal/
│   │   ├── Common/
│   │   ├── DocumentUploader/
│   │   └── UserAvatar/
│   ├── layouts/
│   │   └── AppLayout.jsx
│   ├── hooks/
│   │   ├── index.js
│   │   └── common/
│   ├── config/
│   ├── consts/
│   ├── utils/
│   └── styles/
│       ├── index.css
│       └── global.css
└── ...
```

## 组件详细说明

### 1. 页面主容器 (DiscussionPage/DiscussionPage.jsx)

**功能特点：**
- 双栏布局管理（左侧主讨论区，右侧边栏）
- 状态协调和组件组合
- 响应式设计支持
- AI功能集成管理

**关键属性：**
```jsx
<DiscussionPage
  discussionId={discussionId}
  initialData={initialData}
/>
```

**依赖关系：**
- 需要所有子组件的导入
- 使用页面专属hooks进行状态管理

### 2. 讨论头部组件 (DiscussionHeader/DiscussionHeader.jsx)

**功能特点：**
- 显示讨论基本信息（标题、描述、创建者等）
- 分享功能实现
- 移除冗余显示

**状态管理：**
```jsx
const { discussion } = useDiscussionState(discussionId);
```

### 3. 消息列表组件 (MessageList/MessageList.jsx)

**功能特点：**
- 消息列表展示和滚动
- 自动滚动定位
- 性能优化

**状态管理：**
```jsx
const { messages, autoScroll, scrollToBottom } = useMessages(discussionId);
```

### 4. 消息输入组件 (MessageInput/MessageInput.jsx)

**功能特点：**
- 固定输入框设计
- 用户头像显示
- 发送体验优化

**状态管理：**
```jsx
const { sendMessage, isGenerating } = useDiscussionState(discussionId);
```

### 5. 历史话题组件 (HistoricalTopics/HistoricalTopics.jsx)

**功能特点：**
- 话题列表展示
- 搜索和筛选功能
- 话题切换逻辑

**状态管理：**
```jsx
const { historicalTopics, setHistoricalTopics } = useDiscussionState(discussionId);
```

### 6. AI辩论生成器 (AIDebateGenerator/AIDebateGenerator.jsx)

**功能特点：**
- AI辩论内容生成
- 角色标识和内容格式化
- 生成状态管理

**状态管理：**
```jsx
const { aiDebateActive, isGenerating, generateAIDebate } = useDiscussionState(discussionId);
```

### 7. 快速操作组件 (QuickActions/QuickActions.jsx)

**功能特点：**
- 精简的操作按钮
- 收藏、分享、举报功能
- 移除投票相关功能

**状态管理：**
```jsx
const { discussion, forkDiscussion, createDiscussion } = useDiscussionState(discussionId);
```

### 8. 用户历史组件 (UserHistory/UserHistory.jsx)

**功能特点：**
- 用户发言历史
- 投票记录
- 编辑历史

**状态管理：**
```jsx
const { userHistory } = useUserHistory(userId);
```

## Hooks 系统说明

### 1. useDiscussionState (讨论状态管理)

**功能：**
- 管理讨论基本信息
- 处理消息数据
- 管理用户投票
- 处理历史话题
- AI辩论状态

**导出：**
```js
export { useDiscussionState } from './useDiscussionState';
```

### 2. useMessages (消息管理)

**功能：**
- 消息获取和缓存
- 消息排序和过滤
- 自动滚动控制

**导出：**
```js
export { useMessages } from './useMessages';
```

### 3. useVoting (投票管理)

**功能：**
- 简化的投票逻辑
- 投票状态管理
- 投票结果同步

**导出：**
```js
export { useVoting } from './useVoting';
```

### 4. useForkDiscussion (分支讨论)

**功能：**
- 创建讨论分支
- 分支状态管理

**导出：**
```js
export { useForkDiscussion } from './useForkDiscussion';
```

### 5. useCreateDiscussion (创建讨论)

**功能：**
- 创建新讨论
- 讨论验证

**导出：**
```js
export { useCreateDiscussion } from './useCreateDiscussion';
```

## 样式系统说明

### 1. CSS 变量系统 (DiscussionPage.css)

**变量分类：**
- 布局尺寸变量
- 间距系统变量
- 颜色系统变量
- 阴影系统变量
- 圆角系统变量
- 字体系统变量
- 过渡动画变量

**主题支持：**
- 暗色主题自动适配
- 响应式断点设置
- 可访问性改进

### 2. 组件样式模块

**命名规范：**
- 每个组件有独立的CSS模块
- 使用组件名称作为样式类名前缀
- 遵循BEM命名规范

**文件结构：**
```
styles/
├── DiscussionPage.module.css
├── DiscussionHeader.module.css
├── MessageList.module.css
├── MessageInput.module.css
├── HistoricalTopics.module.css
├── AIDebateGenerator.module.css
├── QuickActions.module.css
└── UserHistory.module.css
```

## 入口文件配置

### 1. vite.config.js 页面注册

```js
{
  name: 'discussion',
  entry: '/src/entries/discussion.jsx',
  data: { title: '讨论页面' },
}
```

### 2. 入口文件 (entries/discussion.jsx)

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppLayout } from '../layouts/AppLayout'
import { DiscussionPage } from '../pages/DiscussionPage/DiscussionPage'
import '../styles/index.css'
import '../styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppLayout navKey="discussion">
      <DiscussionPage />
    </AppLayout>
  </React.StrictMode>,
)
```

## 开发规范遵循

### 1. MPA 架构原则
- ✅ 使用独立入口文件
- ✅ 避免客户端路由
- ✅ 共享AppLayout外壳
- ✅ 整页刷新跳转

### 2. 目录结构规范
- ✅ 页面以目录形式存在
- ✅ 入口文件统一放entries目录
- ✅ 页面专属组件放pages/components目录
- ✅ 跨页面复用组件放src/components目录

### 3. 组件开发规范
- ✅ 组件目录与组件同名
- ✅ 组件就近放置原则
- ✅ 单一职责原则
- ✅ 样式就近组织

### 4. Hooks管理规范
- ✅ 页面专属hooks放pages/hooks目录
- ✅ 通用hooks放src/hooks/common目录
- ✅ 单一职责原则
- ✅ 使用index.js聚合导出

## 迁移指南

### 1. 现有组件保留
- DiscussionActions
- DiscussionThread
- MessageItem
- VotingSystem
- ForkDialog

### 2. 新增组件
- DiscussionPage (主容器)
- HistoricalTopics
- AIDebateGenerator
- QuickActions (重构)
- UserHistory

### 3. 样式迁移
- 保持现有样式兼容性
- 渐进式采用新的CSS变量系统
- 保持响应式设计一致性

## 开发流程

### 1. 组件开发顺序
1. DiscussionPage (主容器)
2. DiscussionHeader
3. MessageList
4. MessageInput
5. HistoricalTopics
6. AIDebateGenerator
7. QuickActions
8. UserHistory

### 2. 测试策略
- 单元测试覆盖核心逻辑
- 集成测试验证组件交互
- 端到端测试验证用户体验

### 3. 部署策略
- 灰度发布
- 性能监控
- 用户反馈收集

## 维护指南

### 1. 组件维护
- 定期更新依赖
- 修复兼容性问题
- 优化性能

### 2. 样式维护
- 更新CSS变量系统
- 保持设计一致性
- 响应式适配更新

### 3. 文档维护
- 更新组件文档
- 维护API文档
- 更新开发规范

这个目录结构遵循了项目的MPA架构和开发规范，提供了清晰的组件组织和开发指导。