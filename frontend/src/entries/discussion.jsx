import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppLayout } from '../layouts/AppLayout'
import { DiscussionPage } from '../pages/DiscussionPage/DiscussionPage'
import '../styles/index.css'
import '../styles/global.css'

// 协同讨论页面入口（对应 discussion.html）
ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
    <AppLayout navKey="discussion">
      <DiscussionPage />
    </AppLayout>
  // </React.StrictMode>,
)
