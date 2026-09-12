import React from 'react'
import './VotingSystem.css'

/**
 * 投票系统组件
 * 显示当前投票和创建新投票的界面
 */
export const VotingSystem = ({ 
  currentVote, 
  onCreateVote,
  onVote,
  onEndVote,
  onGetVoteResult 
}) => {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [createData, setCreateData] = React.useState({
    title: '',
    description: '',
    options: ['', ''],
    maxVotes: 1
  })

  // 处理投票
  const handleVote = (optionId) => {
    onVote(optionId)
  }

  // 结束投票
  const handleEndVote = () => {
    onEndVote()
  }

  // 创建新投票
  const handleCreateVote = () => {
    if (createData.title.trim() && createData.options.filter(opt => opt.trim()).length >= 2) {
      onCreateVote({
        title: createData.title,
        description: createData.description,
        options: createData.options.filter(opt => opt.trim())
      })
      setIsCreateOpen(false)
      setCreateData({
        title: '',
        description: '',
        options: ['', ''],
        maxVotes: 1
      })
    }
  }

  // 添加选项
  const addOption = () => {
    if (createData.options.length < 8) {
      setCreateData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }))
    }
  }

  // 更新选项
  const updateOption = (index, value) => {
    const newOptions = [...createData.options]
    newOptions[index] = value
    setCreateData(prev => ({
      ...prev,
      options: newOptions
    }))
  }

  // 移除选项
  const removeOption = (index) => {
    if (createData.options.length > 2) {
      const newOptions = [...createData.options]
      newOptions.splice(index, 1)
      setCreateData(prev => ({
        ...prev,
        options: newOptions
      }))
    }
  }

  if (!currentVote) {
    return (
      <div className="voting-system">
        <div className="voting-header">
          <h3>投票系统</h3>
          <button 
            className="primary-btn"
            onClick={() => setIsCreateOpen(true)}
          >
            创建投票
          </button>
        </div>
        
        {isCreateOpen && (
          <div className="create-vote-dialog">
            <div className="dialog-header">
              <h4>创建新投票</h4>
              <button 
                className="close-btn"
                onClick={() => setIsCreateOpen(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="form-group">
              <label>投票标题</label>
              <input
                type="text"
                className="form-input"
                placeholder="输入投票标题..."
                value={createData.title}
                onChange={(e) => setCreateData(prev => ({ ...prev, title: e.target.value }))}
                maxLength={50}
              />
            </div>
            
            <div className="form-group">
              <label>投票描述（可选）</label>
              <textarea
                className="form-textarea"
                placeholder="描述投票内容..."
                value={createData.description}
                onChange={(e) => setCreateData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                maxLength={200}
              />
            </div>
            
            <div className="form-group">
              <div className="options-header">
                <label>投票选项</label>
                <button 
                  className="secondary-btn"
                  onClick={addOption}
                  disabled={createData.options.length >= 8}
                >
                  + 添加选项
                </button>
              </div>
              
              {createData.options.map((option, index) => (
                <div key={index} className="option-input">
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`选项 ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    maxLength={30}
                  />
                  {createData.options.length > 2 && (
                    <button 
                      className="remove-btn"
                      onClick={() => removeOption(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="form-actions">
              <button 
                className="secondary-btn"
                onClick={() => setIsCreateOpen(false)}
              >
                取消
              </button>
              <button 
                className="primary-btn"
                onClick={handleCreateVote}
                disabled={!createData.title.trim() || createData.options.filter(opt => opt.trim()).length < 2}
              >
                创建投票
              </button>
            </div>
          </div>
        )}
        
        <div className="no-vote-placeholder">
          <div className="placeholder-icon">🗳️</div>
          <p>暂无进行中的投票</p>
          <button 
            className="primary-btn"
            onClick={() => setIsCreateOpen(true)}
          >
            创建第一个投票
          </button>
        </div>
      </div>
    )
  }

  const voteResult = onGetVoteResult()

  return (
    <div className="voting-system active">
      <div className="voting-header">
        <h3>当前投票</h3>
        {currentVote.isActive && (
          <button 
            className="secondary-btn"
            onClick={handleEndVote}
          >
            结束投票
          </button>
        )}
      </div>
      
      <div className="vote-content">
        <h4>{currentVote.title}</h4>
        {currentVote.description && (
          <p className="vote-description">{currentVote.description}</p>
        )}
        
        <div className="vote-options">
          {currentVote.options.map((option) => {
            const percentage = voteResult ? 
              (option.count / voteResult.totalVotes * 100).toFixed(1) : 0
            const hasVoted = option.voters.includes('当前用户')
            
            return (
              <div 
                key={option.id}
                className={`vote-option ${hasVoted ? 'voted' : ''}`}
                onClick={() => handleVote(option.id)}
              >
                <div className="option-content">
                  <span className="option-text">{option.text}</span>
                  <div className="option-bar">
                    <div 
                      className="option-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="option-stats">
                    <span className="option-count">{option.count} 票</span>
                    <span className="option-percentage">{percentage}%</span>
                  </div>
                </div>
                
                {hasVoted && (
                  <span className="vote-indicator">
                    {currentVote.maxVotes > 1 ? '✓' : '已投票'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        
        {currentVote.isActive && (
          <div className="vote-info">
            <span className="vote-status">
              最多可投 {currentVote.maxVotes} 票
            </span>
            {currentVote.maxVotes > 1 && (
              <span className="vote-progress">
                已投 1/{currentVote.maxVotes} 票
              </span>
            )}
          </div>
        )}
      </div>
      
      {!currentVote.isActive && voteResult && voteResult.winner && (
        <div className="vote-result">
          <div className="result-header">
            <h4>投票结果</h4>
            <span className="winner-badge">🏆</span>
          </div>
          <div className="winner-info">
            <span className="winner-text">获胜选项：</span>
            <span className="winner-option">{voteResult.winner.text}</span>
          </div>
          <div className="winner-stats">
            <span>{voteResult.winner.count} 票</span>
            <span>{voteResult.winner.percentage}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default VotingSystem