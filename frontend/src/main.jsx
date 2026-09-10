import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppLayout } from './layouts/AppLayout'
import { HomePage } from './pages/HomePage'
import './index.css'
import './styles/global.css'

// 首页入口（对应 index.html）
// MPA 改造后，首页内容拆分为 HomePage，外层布局由 AppLayout 统一提供。
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppLayout navKey="home">
      <HomePage />
    </AppLayout>
  </React.StrictMode>,
)
