import React from 'react'
import { useCreateDiscussion } from '../../hooks/useCreateDiscussion'
import './CreateDiscussionDialog.css'

/**
 * 创建讨论对话框组件
 * 
 * 功能特性：
 * - 讨论标题和描述输入
 * - 标签选择和管理
 * - 分类选择
 * - 公开/私密设置
 * - 表单验证
 * - 创建成功回调
 */
export const CreateDiscussionDialog = ({
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  const { createDiscussionForm, errors, submitting, error, 
          tagOptions, categoryOptions, handleCreateDiscussion,
          handleChange, handleAddTag, handleRemoveTag, resetForm } = useCreateDiscussion()

  // 如果对话框未打开，不渲染任何内容
  if (!isOpen) {
    return null
  }

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault()
    await handleCreateDiscussion(
      (newDiscussion) => {
        onSuccess(newDiscussion)
        onClose()
      },
      (errorMessage) => {
        onError(errorMessage)
      }
    )
  }

  return (
    <div className="create-discussion-dialog-overlay" onClick={onClose}>
      <div className="create-discussion-dialog" onClick={(e) => e.stopPropagation()}>
        {/* 对话框头部 */}
        <div className="create-discussion-dialog-header">
          <h2>创建新讨论</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* 对话框内容 */}
        <form onSubmit={handleSubmit} className="create-discussion-form">
          {/* 标题输入 */}
          <div className="form-group">
            <label htmlFor="title">讨论标题 *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={createDiscussionForm.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="请输入讨论标题..."
              className={`form-input ${errors.title ? 'error' : ''}`}
              disabled={submitting}
              maxLength="100"
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
            <div className="char-count">
              {createDiscussionForm.title.length}/100
            </div>
          </div>

          {/* 描述输入 */}
          <div className="form-group">
            <label htmlFor="description">讨论描述 *</label>
            <textarea
              id="description"
              name="description"
              value={createDiscussionForm.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="请详细描述讨论内容、背景和目标..."
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              disabled={submitting}
              rows="4"
              maxLength="500"
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
            <div className="char-count">
              {createDiscussionForm.description.length}/500
            </div>
          </div>

          {/* 分类选择 */}
          <div className="form-group">
            <label htmlFor="category">讨论分类</label>
            <select
              id="category"
              name="category"
              value={createDiscussionForm.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="form-select"
              disabled={submitting}
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 标签选择 */}
          <div className="form-group">
            <label>相关标签</label>
            <div className="tags-input-container">
              <div className="selected-tags">
                {createDiscussionForm.tags.map(tag => (
                  <span key={tag} className="tag-item">
                    {tag}
                    <button
                      type="button"
                      className="remove-tag"
                      onClick={() => handleRemoveTag(tag)}
                      disabled={submitting}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="tag-suggestions">
                {tagOptions
                  .filter(tag => !createDiscussionForm.tags.includes(tag))
                  .slice(0, 8)
                  .map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className="suggested-tag"
                      onClick={() => handleAddTag(tag)}
                      disabled={submitting}
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* 公开/私密设置 */}
          <div className="form-group">
            <label>讨论可见性</label>
            <div className="visibility-options">
              <label className="radio-option">
                <input
                  type="radio"
                  name="isPublic"
                  checked={createDiscussionForm.isPublic}
                  onChange={(e) => handleChange('isPublic', true)}
                  disabled={submitting}
                />
                <span className="radio-label">公开讨论</span>
                <span className="radio-description">任何人都可以参与</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="isPublic"
                  checked={!createDiscussionForm.isPublic}
                  onChange={(e) => handleChange('isPublic', false)}
                  disabled={submitting}
                />
                <span className="radio-label">私密讨论</span>
                <span className="radio-description">仅邀请用户可参与</span>
              </label>
            </div>
          </div>

          {/* 错误显示 */}
          {error && (
            <div className="form-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? '创建中...' : '创建讨论'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// 组件属性验证（运行时）
CreateDiscussionDialog.propTypes = {
  isOpen: ({ isOpen }, propName, componentName) => {
    if (typeof isOpen !== 'boolean') {
      return new Error(`${componentName}: prop '${propName}' must be a boolean`)
    }
  },
  onClose: ({ onClose }, propName, componentName) => {
    if (typeof onClose !== 'function') {
      return new Error(`${componentName}: prop '${propName}' must be a function`)
    }
  },
  onSuccess: ({ onSuccess }, propName, componentName) => {
    if (typeof onSuccess !== 'function') {
      return new Error(`${componentName}: prop '${propName}' must be a function`)
    }
  },
  onError: ({ onError }, propName, componentName) => {
    if (typeof onError !== 'function') {
      return new Error(`${componentName}: prop '${propName}' must be a function`)
    }
  }
}