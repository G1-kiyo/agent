import { useState } from 'react'
import { useAuth } from '../../../hooks'
import { AuthModal } from '../AuthModal/AuthModal'
import { UserMenu } from '../UserMenu/UserMenu'
import './UserAvatar.css'

/**
 * 用户头像组件
 * 在侧边栏底部显示用户头像区域
 */
export const UserAvatar = () => {
  const { user, isAuthenticated, loading, login, register, logout} = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  console.log("重新渲染",user,isAuthenticated,loading)
  /**
   * 处理头像点击
   */
  const handleAvatarClick = () => {
    if (!isAuthenticated && !loading) {
      // 未登录：打开登录弹窗
      setIsAuthModalOpen(true)
    } else if (isAuthenticated) {
      // 已登录：切换菜单
      setIsMenuOpen(!isMenuOpen)
    }
  }

  /**
   * 关闭菜单
   */
  const handleCloseMenu = () => {
    setIsMenuOpen(false)
  }

  /**
   * 关闭登录弹窗
   */
  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false)
  }

  /**
   * 获取用户名首字母作为头像
   */
  const getAvatarText = () => {
    if (!user?.username) return '?'
    return user.username.charAt(0).toUpperCase()
  }

  /**
   * 渲染未登录状态
   */
  const renderUnauthenticated = () => (
    <button
      className="user-avatar unauthenticated"
      onClick={handleAvatarClick}
      aria-label="登录"
    >
      <div className="avatar-circle">
        <span className="login-icon">👤</span>
      </div>
      <div className="user-info">
        <div className="user-name">登录</div>
      </div>
    </button>
  )

  /**
   * 渲染已登录状态
   */
  const renderAuthenticated = () => (
    <div className="user-avatar-container">
      <button
        className={`user-avatar authenticated ${isMenuOpen ? 'menu-open' : ''}`}
        onClick={handleAvatarClick}
        aria-label="用户菜单"
        aria-expanded={isMenuOpen}
      >
        <div className="avatar-circle">
          {getAvatarText()}
        </div>
        <div className="user-info">
          <div className="user-name">{user.username}</div>
          <div className="user-email">{user.email}</div>
        </div>
        <div className="menu-arrow">▼</div>
      </button>

      {/* 用户菜单 */}
      {isMenuOpen && <UserMenu isOpen={isMenuOpen} onClose={handleCloseMenu} auth={{user, logout}} />}
    </div>
  )

  /**
   * 渲染加载状态
   */
  const renderLoading = () => (
    <div className="user-avatar loading">
      <div className="avatar-circle">
        <div className="loading-spinner"></div>
      </div>
      <div className="user-info">
        <div className="user-name">加载中...</div>
      </div>
    </div>
  )

  return (
    <>
      {loading ? renderLoading() : isAuthenticated ? renderAuthenticated() : renderUnauthenticated()}

      {/* 登录/注册弹窗 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleCloseAuthModal}
        auth={{
          login,
          register,
          loading
        }}
      />
    </>
  )
}

export default UserAvatar