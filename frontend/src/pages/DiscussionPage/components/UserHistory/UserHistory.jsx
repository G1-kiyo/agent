import React from 'react'
import './UserHistory.css'

/**
 * 用户历史记录组件
 * 展示用户在当前讨论中的历史记录，包括发言、投票等
 */
export const UserHistory = ({ 
  userVotes = [],
  messages = [],
  showExpanded = false,
  limit = 5
}) => {
  const [expanded, setExpanded] = React.useState(showExpanded)
  
  // 获取用户的消息历史
  const userMessages = messages.filter(msg => !msg.isAI)
  
  // 获取最近的投票
  const recentVotes = userVotes.slice(0, limit)
  
  // 获取用户统计
  const userStats = {
    totalMessages: userMessages.length,
    totalVotes: userVotes.length,
    recentMessages: userMessages.slice(0, limit),
    recentVotes: recentVotes
  }

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) {
      return '刚刚'
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`
    } else {
      return `${Math.floor(diff / 86400000)}天前`
    }
  }

  return (
    <div className="user-history">
      <div className="history-header">
        <h3 className="history-title">我的记录</h3>
        <button
          className="expand-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '收起' : '展开'}
        </button>
      </div>
      
      {!expanded && (
        <div className="history-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-number">{userStats.totalMessages}</span>
              <span className="stat-label">发言数</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userStats.totalVotes}</span>
              <span className="stat-label">投票数</span>
            </div>
          </div>
          <div className="summary-text">
            <p>点击展开查看详细记录</p>
          </div>
        </div>
      )}
      
      {expanded && (
        <div className="history-content">
          {/* 消息历史 */}
          <div className="history-section">
            <h4 className="section-title">最近发言</h4>
            <div className="section-content">
              {userStats.recentMessages.length > 0 ? (
                userStats.recentMessages.map((message) => (
                  <div key={message.id} className="history-item">
                    <div className="item-header">
                      <span className="item-time">{formatTime(message.createdAt)}</span>
                    </div>
                    <div className="item-content">
                      <p className="item-text">{message.content}</p>
                      <div className="item-actions">
                        <button
                          className="action-btn small"
                          onClick={() => console.log('编辑消息:', message.id)}
                        >
                          编辑
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>暂无发言记录</p>
                </div>
              )}
            </div>
          </div>
          
          {/* 投票历史 */}
          <div className="history-section">
            <h4 className="section-title">最近投票</h4>
            <div className="section-content">
              {userStats.recentVotes.length > 0 ? (
                userStats.recentVotes.map((vote) => (
                  <div key={vote.id} className="history-item vote-item">
                    <div className="vote-header">
                      <span className="vote-target">{vote.targetId}</span>
                      <span className={`vote-type ${vote.value > 0 ? 'upvote' : 'downvote'}`}>
                        {vote.value > 0 ? '👍' : '👎'}
                      </span>
                    </div>
                    <div className="vote-content">
                      <span className="vote-time">{formatTime(vote.createdAt)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>暂无投票记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserHistory