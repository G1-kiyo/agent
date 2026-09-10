import { useEffect, useRef } from 'react'
import { useAuth } from '../../../hooks'
import './UserMenu.css'

/**
 * 用户菜单组件
 * 点击头像后从上方弹出
 */
export const UserMenu = ({ isOpen, onClose,auth }) => {
  const { user, logout } = auth
  const menuRef = useRef(null)

  // 如果菜单未打开，不渲染任何内容
  if (!isOpen || !user) return null

  /**
   * 处理点击菜单项
   */
  const handleMenuItemClick = (action) => {
    switch (action) {
      case 'profile':
        console.log('点击个人中心')
        // TODO: 跳转到个人中心页面
        break
      case 'settings':
        console.log('点击设置')
        // TODO: 打开设置弹窗
        break
      case 'logout':
        logout()
        break
    }
    onClose()
  }

  /**
   * 处理点击外部区域关闭菜单
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose()
      }
    }

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [onClose])

  /**
   * 获取用户名首字母作为头像
   */
  const getAvatarText = () => {
    if (!user?.username) return '?'
    return user.username.charAt(0).toUpperCase()
  }

  return (
    <div className="user-menu" ref={menuRef} role="menu" aria-label="用户菜单">
      {/* 用户信息区域（不可点击） */}
      <div className="menu-user-info">
        <div className="menu-avatar">
          {getAvatarText()}
        </div>
        <div className="menu-user-details">
          <div className="menu-username">{user.username}</div>
          <div className="menu-email">{user.email}</div>
        </div>
      </div>

      {/* 分隔线 */}
      <div className="menu-divider"></div>

      {/* 功能选项 */}
      <div className="menu-items">
        <button
          className="menu-item"
          onClick={() => handleMenuItemClick('profile')}
          role="menuitem"
        >
          <span className="menu-item-icon">👤</span>
          <span className="menu-item-label">个人中心</span>
        </button>

        <button
          className="menu-item"
          onClick={() => handleMenuItemClick('settings')}
          role="menuitem"
        >
          <span className="menu-item-icon">⚙️</span>
          <span className="menu-item-label">设置</span>
        </button>
      </div>

      {/* 分隔线 */}
      <div className="menu-divider"></div>

      {/* 退出登录 */}
      <div className="menu-items">
        <button
          className="menu-item danger"
          onClick={() => handleMenuItemClick('logout')}
          role="menuitem"
        >
          <span className="menu-item-icon">🚪</span>
          <span className="menu-item-label">退出登录</span>
        </button>
      </div>
    </div>
  )
}
