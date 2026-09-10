import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppLayout } from '../layouts/AppLayout'
import { HomePage } from '../pages/HomePage/HomePage'
import '../styles/index.css'
import '../styles/global.css'

// 首页入口（对应 index.html）
// 与其它入口统一放在 entries 目录下，外层布局由 AppLayout 统一提供。
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppLayout navKey="home">
      <HomePage />
    </AppLayout>
  </React.StrictMode>,
)
