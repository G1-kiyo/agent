import ReactDOM from 'react-dom/client'
import { AppLayout } from '../layouts/AppLayout'
import { KnowledgePage } from '@pages/KnowledgePage/KnowledgePage'
import '@styles/index.css'
import '@styles/global.css'

// 知识库页面入口（对应 knowledge.html）
ReactDOM.createRoot(document.getElementById('root')).render(
  <AppLayout navKey="knowledge">
    <KnowledgePage />
  </AppLayout>
)
