import { useState, useRef, useEffect } from 'react'
import './MessageInput.css'

/**
 * 消息输入组件 - 优化版本
 * 用于发表新评论和回复，支持固定输入框、用户头像等功能
 */
export const MessageInput = ({ 
  placeholder = "发表你的观点...", 
  onSubmit,
  onCancel,
  initialContent = '',
  userAvatar = null,
  userName = '',
  showUserAvatar = true
}) => {
  const [content, setContent] = useState(initialContent)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef(null)

  // 自动调整文本框高度
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }, [content])

  // 保持焦点状态
  useEffect(() => {
    if (textareaRef.current && !isSubmitting) {
      textareaRef.current.focus()
    }
  }, [isSubmitting])

  // 处理输入
  const handleInputChange = (e) => {
    setContent(e.target.value)
  }

  // 处理快捷键
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  // 处理焦点变化
  const handleFocus = () => {
    setIsFocused(true)
  }

  // 处理失焦
  const handleBlur = () => {
    setIsFocused(false)
  }

  // 提交消息
  const handleSubmit = async () => { 
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit(content.trim())
      setContent('')
      // 发送成功后保持焦点在输入框
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 100)
    } catch (error) {
      console.error('Failed to submit message:', error)
      // 可以在这里添加错误提示
    } finally {
      setIsSubmitting(false)
    }
  }

  // 取消输入
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    setContent('')
  }

  // 字符数统计
  const charCount = content.length
  const maxChars = 500
  const canSubmit = content.trim().length > 0 && charCount <= maxChars

  return (
    <div className="message-input-container">
      {/* 用户信息和头像 */}
      {showUserAvatar && (
        <div className="user-section">
          <div className="message-input-user-avatar">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="message-input-avatar-image" />
            ) : (
              <div className="message-input-avatar-placeholder">
                {userName ? userName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          <div className="user-info">
            <span className="user-name">{userName || '匿名用户'}</span>
            <span className="user-status">在线</span>
          </div>
        </div>
      )}

      {/* 输入头部 */}
      <div className="input-header">
        <span className="input-label">发表观点</span>
        <div className="input-hint">
          <span>Ctrl+Enter 发送</span>
          <span>Esc 取消</span>
        </div>
      </div>
      
      {/* 输入区域 */}
      <div className="input-wrapper">
        <textarea
          ref={textareaRef}
          className={`message-textarea ${isFocused ? 'focused' : ''}`}
          placeholder={placeholder}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          rows={2}
          disabled={isSubmitting}
        />
        
        {/* 操作按钮 */}
        <div className="input-actions">
          <button
            className="cancel-btn"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            取消
          </button>
          <button
            className={`submit-btn ${!canSubmit ? 'disabled' : ''}`}
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading-spinner"></span>
                发送中...
              </>
            ) : (
              <>
                <span className="send-icon">✓</span>
                发送
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* 字符计数和状态 */}
      <div className="input-footer">
        <span className={`char-count ${charCount > maxChars - 50 ? 'warning' : ''} ${charCount > maxChars ? 'error' : ''}`}>
          {charCount}/{maxChars}
        </span>
        {charCount > maxChars && (
          <span className="char-warning">超出字数限制</span>
        )}
      </div>
    </div>
  )
}