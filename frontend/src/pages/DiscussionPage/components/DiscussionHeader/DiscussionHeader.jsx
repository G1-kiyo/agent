import React from 'react'
import { useDiscussionState } from '../../hooks'
import './DiscussionHeader.css'

/**
 * 讨论头部组件 - 重新设计
 * 展示讨论标题、描述、关键信息和标签
 */
export const DiscussionHeader = ({ discussion, loading, error }) => {


  // 获取创建时间信息
  const formatCreateTime = (timestamp) => {
    if (!timestamp) return '未知时间'

    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatLastActivity = (timestamp) => {
    if (!timestamp) return '未知时间'

    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) {
      return '刚刚活跃'
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} 分钟前活跃`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} 小时前活跃`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  return (
    <div className="discussion-header">
      {loading && <div className="loading">加载中...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && discussion && (
        <>
          {/* 标题区域 */}
          <div className="title-section">
            <h2 className="topic-title">{discussion?.title || '暂无标题'}</h2>
            <div className="title-meta">
              <div className="meta-left">
                <div className={`status-badge ${discussion?.is_active ? 'success' : 'muted'}`}>
                  {discussion?.is_active ? '活跃' : '非活跃'}
                </div>
                <div className="category-badge">
                  <span>🏷️ {discussion.category}</span>
                </div>
              </div>
              <div className="stats-container">
                <div className="stat-card">
                  <div className="stat-number">{discussion.message_count}</div>
                  <div className="stat-label">消息数</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{discussion.reply_count}</div>
                  <div className="stat-label">回复数</div>
                </div>
              </div>
            </div>
          </div>

          {/* 描述区域 */}
          {discussion?.desc && (
            <div className="description-section">
              <p className="topic-description">{discussion.desc}</p>
            </div>
          )}

          {/* 详细信息区域 */}
          <div className="detail-section">
            <div className="info-item">
              <span className="info-label">发起人:</span>
              <span className="info-value">{discussion.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">📅 创建时间:</span>
              <span className="info-value">{formatCreateTime(discussion.create_at)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">👥 参与者:</span>
              <span className="info-value">{discussion.participant_count}人</span>
            </div>
            <div className="info-item">
              <span className="info-label">🔄 最后活跃:</span>
              <span className="info-value">{formatLastActivity(discussion.last_activity)}</span>
            </div>
          </div>

          {/* 标签区域 */}
          {discussion?.tags && discussion.tags.length > 0 && (
            <div className="tags-section">
              {discussion.tags.map((tag, index) => (
                <span key={index} className="topic-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}