import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppLayout } from '../layouts/AppLayout'
import { SearchPage } from '../pages/SearchPage/SearchPage'
import '../styles/index.css'
import '../styles/global.css'

// 智能检索页面入口（对应 search.html）
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppLayout navKey="search">
      <SearchPage />
    </AppLayout>
  </React.StrictMode>,
)
