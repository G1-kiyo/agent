import ReactDOM from 'react-dom/client'
import { AppLayout } from '../layouts/AppLayout'
import { AdminPage } from '@pages/AdminPage/AdminPage'
import '@styles/index.css'
import '@styles/global.css'

// 管理后台页面入口（对应 admin.html）
ReactDOM.createRoot(document.getElementById('root')).render(
  <AppLayout navKey="admin">
    <AdminPage />
  </AppLayout>
)
