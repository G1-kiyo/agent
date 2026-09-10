# 协同讨论页面 (Discussion Page)

## 项目概述

协同讨论页面是基于React 18和Vite构建的完整讨论系统，实现了群组讨论、评论、投票和分叉功能。该页面遵循项目开发规范，使用组件化架构和React Hook管理状态。

## 技术栈

- **框架**: React 18
- **构建工具**: Vite 4
- **架构模式**: MPA (Multi-Page Application)
- **状态管理**: React Hook + 自定义Hook
- **样式**: CSS + CSS变量
- **API**: 统一的请求框架

## 核心功能

### 1. 讨论管理
- 创建新讨论
- 分叉现有讨论
- 讨论状态管理（进行中、已结束、已归档）

### 2. 消息系统
- 发送评论消息
- 回复消息
- 编辑和删除消息
- 消息表情反应

### 3. 投票系统
- 创建投票
- 投票功能
- 实时投票结果统计
- 结束投票并宣布获胜选项

### 4. 分叉功能
- 创建讨论分叉
- 分叉历史追踪
- 分叉关系管理

## 组件架构

### 页面组件
- `DiscussionPage` - 主页面组件，集成所有子组件

### 子组件
1. **DiscussionHeader** - 讨论页面头部
   - 显示讨论标题和描述
   - 提供创建和分叉讨论按钮

2. **DiscussionThread** - 讨论线程组件
   - 显示讨论主题和统计信息
   - 包含消息列表和消息输入

3. **MessageList** - 消息列表
   - 显示所有消息
   - 支持消息操作（编辑、删除、反应）

4. **MessageItem** - 单个消息组件
   - 显示消息内容、作者、时间
   - 支持消息操作

5. **MessageInput** - 消息输入框
   - 支持文本输入和发送
   - 表单验证

6. **VotingSystem** - 投票系统
   - 显示当前投票
   - 支持投票和查看结果

7. **ForkDialog** - 分叉对话框
   - 创建讨论分叉
   - 表单验证

8. **DiscussionActions** - 讨论操作按钮
   - 快速操作按钮（发送、投票、分享、收藏）

## 状态管理 Hook

### 1. useDiscussionState
- **职责**: 管理讨论状态、当前主题、分叉历史
- **状态**: 
  - currentTopic: 当前讨论主题
  - discussionStatus: 讨论状态
  - discussionStats: 统计信息
  - forkHistory: 分叉历史

### 2. useMessages
- **职责**: 管理消息相关功能
- **状态**:
  - messages: 消息列表
  - loading: 加载状态
- **方法**:
  - sendMessage: 发送消息
  - editMessage: 编辑消息
  - deleteMessage: 删除消息
  - reactToMessage: 消息反应

### 3. useVoting
- **职责**: 管理投票功能
- **状态**:
  - vote: 投票函数
  - votes: 投票记录
  - votingOptions: 投票选项
  - isVoting: 投票状态
- **方法**:
  - vote: 投票
  - endVote: 结束投票

### 4. useForkDiscussion
- **职责**: 管理讨论分叉功能
- **状态**:
  - forkDiscussion: 分叉函数
  - isForking: 分叉状态
  - forkHistory: 分叉历史
- **方法**:
  - forkDiscussion: 创建分叉

### 5. useCreateDiscussion
- **职责**: 管理创建讨论功能
- **状态**:
  - createDiscussionForm: 创建讨论表单
  - submitting: 提交状态
- **方法**:
  - handleCreateDiscussion: 处理创建讨论
  - handleChange: 处理表单变化
  - resetForm: 重置表单

## 样式系统

### CSS变量
- 使用统一的CSS变量系统
- 支持主题切换和响应式设计

### 响应式设计
- 移动端优先的设计理念
- 支持多种屏幕尺寸

### 动画效果
- 平滑的过渡动画
- 加载状态动画
- 交互反馈动画

## API集成

### 请求框架
- 使用项目统一的请求框架
- 自动处理token和错误
- 支持加载状态管理

### API端点
- `/api/v1/discussions` - 讨论相关API
- `/api/v1/messages` - 消息相关API
- `/api/v1/votes` - 投票相关API

## 开发规范

### 组件规范
- 单一职责原则
- 可复用性设计
- 清晰的props接口
- 适当的错误处理

### Hook规范
- 遵循React Hook规则
- 单一职责原则
- 状态管理集中化
- 适当的错误边界

### 样式规范
- 使用CSS变量
- 组件化样式
- 响应式设计
- 一致的命名约定

## 测试

### 单元测试
- 组件渲染测试
- Hook功能测试
- 交互测试

### 集成测试
- 组件间交互测试
- API集成测试
- 状态管理测试

## 部署

### 构建命令
```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

## 贡献指南

1. 遵循项目代码规范
2. 组件和Hook需要添加适当的注释
3. 新功能需要编写测试
4. 提交前进行代码审查

## 相关文档

- [前端开发指南](/docs/frontend-development-guide.md)
- [API规范](/docs/api-specification.md)
- [项目结构说明](/docs/structure.md)

## 更新日志

### v1.0.0 (2026-08-15)
- 完成讨论页面核心功能
- 实现消息系统
- 实现投票系统
- 实现分叉功能
- 完善响应式设计