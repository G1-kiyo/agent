# AI 资讯协作平台

一个基于 React + Vite 的现代 AI 资讯协作平台前端应用。

## 项目结构

```
agent/
├── src/
│   ├── components/       # React 组件
│   ├── App.jsx          # 主应用组件
│   ├── main.jsx         # 入口文件
│   └── index.css        # 全局样式
├── package.json         # 项目配置
├── vite.config.js       # Vite 配置
└── index.html           # HTML 入口
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

项目会在 `http://localhost:3000` 启动开发服务器。

### 生产构建

```bash
npm run build
```

生成的文件会输出到 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

## 功能特性

- 实时资讯摘要生成
- 团队协作讨论
- AI 辅助内容整理
- 响应式设计

## 技术栈

- **框架**: React 18
- **构建工具**: Vite
- **样式**: CSS 变量 + 响应式布局

## 后续集成

待集成后端接口：
- `POST /api/search` - AI 资讯搜索
- `GET /api/messages` - 获取对话历史
- `POST /api/messages` - 发送消息
