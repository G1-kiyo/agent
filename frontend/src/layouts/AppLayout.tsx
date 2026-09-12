import { NAV_ITEMS, getNavByKey } from '../config/nav'
import { UserAvatar } from '@components/index'

/**
 * 共享布局：侧边栏 + 顶部栏。
 *
 * MPA 改造后，所有页面共用同一套外壳。各页面入口只需：
 *   <AppLayout navKey="search">{pageContent}</AppLayout>
 *
 * 当前激活的导航项由 navKey 决定，顶部标题/副标题从导航配置中读取。
 */
export const AppLayout = ({ navKey, children }) => {
  const current = getNavByKey(navKey)
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div>
            <h1>资讯协作</h1>
            <p>面向用户的资讯体验</p>
          </div>
        </div>

        <nav className="nav-list">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              className={`nav-item ${item.key === navKey ? 'active' : ''}`}
              href={item.href}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="sidebar-card">
          <p className="label">今日亮点</p>
          <h3>更快读懂行业动态</h3>
          <p>让 AI 帮你把资讯整理成适合分享与讨论的内容。</p>
        </div>

        <div className="user-section">
          <UserAvatar />
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">AI 资讯协作平台</p>
            <h2>{current.title}</h2>
            <p className="subtitle">{current.subtitle}</p>
          </div>
          <div className="topbar-actions">
            <button className="secondary-btn">查看示例</button>
            <button className="primary-btn">开始体验</button>
          </div>
        </header>

        {children}
      </main>
    </div>
  )
}

export default AppLayout
