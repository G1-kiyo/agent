/**
 * 管理后台页面内容。
 * 原先内联在 App.jsx 中的"管理后台"区块，MPA 改造后拆分为独立页面组件。
 */
import './AdminPage.css'
export const AdminPage = () => {
  return (
    <section className="admin-panel">
      <div className="admin-header">
        <h3>管理后台</h3>
        <p>系统管理与审核</p>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <h4>用户统计</h4>
          <div className="stat-value">1,234</div>
          <p>活跃用户</p>
        </div>
        <div className="stat-card">
          <h4>内容统计</h4>
          <div className="stat-value">5,678</div>
          <p>检索次数</p>
        </div>
        <div className="stat-card">
          <h4>系统状态</h4>
          <div className="stat-value">正常</div>
          <p>运行中</p>
        </div>
      </div>

      <div className="admin-actions">
        <button className="primary-btn">查看系统日志</button>
        <button className="secondary-btn">导出数据</button>
      </div>
    </section>
  )
}

export default AdminPage
