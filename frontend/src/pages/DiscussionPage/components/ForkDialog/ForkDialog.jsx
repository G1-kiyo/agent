/**
 * 分叉讨论对话框
 * 用于创建基于现有讨论的新分支
 */
import { useState, useEffect } from 'react'
import './ForkDialog.css'

export const ForkDialog = ({ 
  isOpen, 
  onClose, 
  onFork, 
  discussion = {},
  isForking = false,
  forkHistory = []
}) => {
  const [forkTitle, setForkTitle] = useState('')
  const [forkDescription, setForkDescription] = useState('')
  const [forkTags, setForkTags] = useState([])
  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState({})

  // 根据父讨论自动初始化表单
  useEffect(() => {
    if (isOpen && discussion) {
      const defaultTitle = `${discussion.title} - 分叉版本`
      const defaultDescription = `基于讨论 "${discussion.title}" 的分叉版本${discussion.description ? `\\n\\n原讨论描述：${discussion.description}` : ''}`
      
      setForkTitle(defaultTitle)
      setForkDescription(defaultDescription)
      setForkTags(discussion.tags || [])
      setErrors({})
    }
  }, [isOpen, discussion])

  // 添加标签
  const handleAddTag = () => {
    if (newTag.trim() && !forkTags.includes(newTag.trim())) {
      setForkTags([...forkTags, newTag.trim()])
      setNewTag('')
    }
  }

  // 移除标签
  const handleRemoveTag = (tagToRemove) => {
    setForkTags(forkTags.filter(tag => tag !== tagToRemove))
  }

  // 处理分叉提交
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 表单验证
    const newErrors = {}
    if (!forkTitle.trim()) {
      newErrors.title = '标题不能为空'
    }
    if (!forkDescription.trim()) {
      newErrors.description = '描述不能为空'
    }
    if (forkTags.length === 0) {
      newErrors.tags = '至少需要一个标签'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // 执行分叉
    onFork({
      title: forkTitle.trim(),
      description: forkDescription.trim(),
      tags: forkTags,
      parentId: discussion.id,
      parentTitle: discussion.title
    })
  }

  // 关闭对话框
  const handleCancel = () => {
    setForkTitle('')
    setForkDescription('')
    setForkTags([])
    setNewTag('')
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fork-dialog-overlay">
      <div className="fork-dialog">
        <div className="dialog-header">
          <h3>分叉讨论</h3>
          <button className="close-btn" onClick={handleCancel}>
            ×
          </button>
        </div>

        <div className="dialog-content">
          <div className="parent-info">
            <div className="parent-discussion">
              <span className="parent-label">原始讨论:</span>
              <span className="parent-title">{discussion.title || '未知讨论'}</span>
            </div>
            {forkHistory.length > 0 && (
              <div className="fork-hint">
                <span className="hint-icon">🌱</span>
                <span className="hint-text">已创建 {forkHistory.length} 个分叉</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="fork-form">
            <div className="form-group">
              <label htmlFor="fork-title">讨论标题 *</label>
              <input
                id="fork-title"
                type="text"
                value={forkTitle}
                onChange={(e) => setForkTitle(e.target.value)}
                placeholder="输入新讨论标题"
                className={`form-input ${errors.title ? 'error' : ''}`}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="fork-description">讨论描述 *</label>
              <textarea
                id="fork-description"
                value={forkDescription}
                onChange={(e) => setForkDescription(e.target.value)}
                placeholder="输入新讨论描述"
                className={`form-input ${errors.description ? 'error' : ''}`}
                rows="4"
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label>标签 *</label>
              <div className="tags-input-container">
                <div className="tags-list">
                  {forkTags.map((tag, index) => (
                    <span key={index} className="tag-item">
                      {tag}
                      <button
                        type="button"
                        className="tag-remove"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="tag-input-container">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="添加标签"
                    className="tag-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="add-tag-btn"
                    onClick={handleAddTag}
                  >
                    添加
                  </button>
                </div>
              </div>
              {errors.tags && <span className="error-message">{errors.tags}</span>}
            </div>

            <div className="dialog-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancel}
                disabled={isForking}
              >
                取消
              </button>
              <button
                type="submit"
                className="confirm-btn"
                disabled={isForking}
              >
                {isForking ? '创建中...' : '创建分叉'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForkDialog