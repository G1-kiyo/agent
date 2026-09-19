import { useState } from 'react'
import './AuthModal.css'

/**
 * 认证弹窗组件
 * 支持登录和注册功能
 */
export const AuthModal = ({ isOpen, onClose, auth }) => {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })
  const [formError, setFormError] = useState('')

  const { login, register, loading } = auth

  // 如果弹窗未打开，不渲染任何内容
  if (!isOpen) return null

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    // 基本验证
    if (mode === 'login') {
      if (!formData.username || !formData.password) {
        setFormError('请填写用户名/邮箱和密码')
        return
      }
    } else {
      // 注册模式
      if (!formData.username || !formData.email || !formData.password) {
        setFormError('请填写所有字段')
        return
      }
      if (formData.password.length < 6) {
        setFormError('密码至少需要 6 个字符')
        return
      }
    }

    try {
      if (mode === 'login') {
        const result = await login(formData.username, formData.password)
        if (result.success) {
          onClose()
        } else {
          setFormError(result.error)
        }
      } else {
        const result = await register(formData.username, formData.email, formData.password)
        if (result.success) {
          onClose()
        } else {
          setFormError(result.error)
        }
      }
      setTimeout(()=>{
        window.location.reload()
      })
    } catch (error) {
      setFormError(error.message)
    }
  }

  /**
   * 处理输入变化
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setFormError('')
  }

  /**
   * 切换登录/注册模式
   */
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setFormData({ username: '', email: '', password: '' })
    setFormError('')
  }

  /**
   * 处理关闭
   */
  const handleClose = () => {
    setFormData({ username: '', email: '', password: '' })
    setFormError('')
    onClose()
  }

  /**
   * 处理点击遮罩层
   */
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  /**
   * 处理 ESC 键
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  return (
    <div
      className="auth-modal-overlay"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div className="auth-modal">
        <div className="auth-modal-header">
          <h2>{mode === 'login' ? '登录' : '注册'}</h2>
          <button className="close-btn" onClick={handleClose} aria-label="关闭">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {formError && (
            <div className="error-message">
              {formError}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">{mode === 'login' ? '用户名/邮箱' : '用户名'}</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={mode === 'login' ? '请输入用户名或邮箱' : '请输入用户名'}
              disabled={loading}
              autoComplete={mode === 'login' ? 'username' : 'username'}
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="email">邮箱</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="请输入邮箱"
                disabled={loading}
                autoComplete="email"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码"
              disabled={loading}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn primary-btn"
              disabled={loading}
            >
              {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
            </button>
          </div>

          <div className="switch-auth">
            {mode === 'login' ? (
              <>
                还没有账号？{' '}
                <a onClick={toggleMode} onKeyDown={(e) => e.key === 'Enter' && toggleMode()}>
                  去注册
                </a>
              </>
            ) : (
              <>
                已有账号？{' '}
                <a onClick={toggleMode} onKeyDown={(e) => e.key === 'Enter' && toggleMode()}>
                  去登录
                </a>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
