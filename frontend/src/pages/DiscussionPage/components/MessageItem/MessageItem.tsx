import { useState } from 'react'
import { useBoundStore } from '@store/index'
import { ReactionOperateType } from '../../const'
import './MessageItem.css'

/**
 * 消息项组件
 * 显示单条消息，包括内容、作者、时间、回复、反应等
 */
export const MessageItem = ({ message, reactions, onReply, onReact, onEdit, onDelete, onFork }) => {
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [showReplyOptions, setShowReplyOptions] = useState(false)
  const [showForkDialog, setShowForkDialog] = useState(false)
  const [showReactionPanel, setShowReactionPanel] = useState(false)

  // 当前用户
  const currentUser = useBoundStore((state: any) => state.user) as any

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(replyContent)
      setReplyContent('')
      setShowReplyInput(false)
    }
  }


  const toggleReplyOptions = (e) => {
    e.stopPropagation()
    setShowReplyOptions(!showReplyOptions)
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) {
      return '刚刚'
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} 分钟前`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} 小时前`
    } else {
      return date.toLocaleDateString('zh-CN')
    }
  }

  // 聚合reaction
  const groupbyReactionType = (reactions: any[]) => {
    const typeMap: any = {}
    // console.log("group", reactions)
    reactions.forEach((r) => {
      if (r.type in typeMap) {
        const count = typeMap[r.type]["count"]
        typeMap[r.type] = { ...typeMap[r.type], count: count + 1 }
      } else {
        typeMap[r.type] = {
          ...r,
          count: 1
        }
      }
    })
    console.log('typemap', Object.values(typeMap))
    return Object.values(typeMap) as Array<{type: string; content: string; count: number; user_id: string}>
  }

  const isCurrentUser = message.user_id === currentUser.id

  return (
    <div className={`message-item ${message.is_host ? 'system-message' : 'user-opinion'}`}>
      <div className="message-header">
        <div className="message-author">
          <span className="avatar">{message.username.charAt(0).toUpperCase()}</span>
          <div className="author-info">
            <span className="author-name">
              {message.username}
              {message.is_host ?
                <span className="message-type-badge system-badge">主持人</span>
                : <span className="message-type-badge opinion-badge">观点</span>}

            </span>
            <span className="message-time">{formatDate(message.create_at)}</span>
          </div>
        </div>


        <div className="message-actions">
          <div
            className={`action-btn ${showReplyOptions ? 'active' : ''}`}
            onClick={toggleReplyOptions}
          >
            ⋮
          </div>
          {showReplyOptions && (
            <div className="action-menu">
              <button
                className="menu-item"
                onClick={() => {
                  setShowReplyInput(!showReplyInput)
                  setShowReplyOptions(false)
                }}
              >
                💬 回复
              </button>
              <button
                className="menu-item"
                onClick={() => {
                  setShowForkDialog(true)
                  setShowReplyOptions(false)
                }}
              >
                🔄 分叉
              </button>
              {isCurrentUser && (
                <>
                  <button
                    className="menu-item"
                    onClick={() => {
                      onEdit(message.message_id)
                      setShowReplyOptions(false)
                    }}
                  >
                    ✏️ 编辑
                  </button>
                  <button
                    className="menu-item delete"
                    onClick={() => {
                      onDelete(message.message_id)
                      setShowReplyOptions(false)
                    }}
                  >
                    🗑️ 删除
                  </button>
                </>
              )}
            </div>
          )}
        </div>

      </div>

      <div className="message-content">
        <div className="system-message-content">
          {message.content}
        </div>
      </div>


      <div className="message-reactions">
        <div className="reaction-list">
          {message.reactions && message.reactions.length > 0 ? (
            groupbyReactionType(message.reactions).map((reaction, index) => {
              const hasUserReacted = reaction?.user_id === currentUser.id
              return (
                <button
                  key={reaction.type}
                  className={`reaction-btn ${hasUserReacted ? 'active' : ''}`}
                  onClick={() => onReact(reaction?.type, reaction?.content, ReactionOperateType.CANCEL)}
                >
                  <span className="reaction-emoji">{reaction?.content}</span>
                  <span className="reaction-count">{reaction?.count || 0}</span>
                </button>
              )
            })
          ) : (
            <div className="no-reactions">
              {/* <span>暂无反应</span> */}
            </div>
          )}
        </div>

        <div className="reaction-actions">
          <button
            className="add-reaction-btn"
            onClick={() => setShowReactionPanel(!showReactionPanel)}
          >
            👍
          </button>
        </div>

        {showReactionPanel && (
          <div className="reaction-panel">
            <div className="reaction-panel-header">
              <span>选择反应</span>
              <button
                className="panel-close"
                onClick={() => setShowReactionPanel(false)}
              >
                ×
              </button>
            </div>
            <div className="reaction-options">
              {reactions.map((reaction) => (
                <button
                  key={reaction.type}
                  className="reaction-option"
                  onClick={() => {
                    onReact(reaction.type, reaction.content, ReactionOperateType.CONFIRM)
                    setShowReactionPanel(false)
                  }}
                >
                  {reaction.content}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>


      {/* {message.is_host && (
        <div className="system-message-footer">
          <button
            className="secondary-btn"
            onClick={() => setShowReplyInput(!showReplyInput)}
          >
            参与讨论
          </button>
        </div>
      )} */}

      {showReplyInput && (
        <div className="reply-input-container">
          <textarea
            className="reply-input"
            placeholder={`回复 ${message.username}...`}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={2}
          />
          <div className="reply-actions">
            <button
              className="secondary-btn"
              onClick={() => {
                setShowReplyInput(false)
                setReplyContent('')
              }}
            >
              取消
            </button>
            <button
              className="primary-btn"
              onClick={handleReply}
              disabled={!replyContent.trim()}
            >
              回复
            </button>
          </div>
        </div>
      )}

      {message.replies && message.replies.length > 0 && (
        <div className="replies-container">
          {message.replies.map((reply) => (
            <div key={reply.reply_id} className="reply-item">
              <div className="reply-header">
                <span className="reply-author">{reply.username}</span>
                <span className="reply-time">{formatDate(reply.create_at)}</span>
              </div>
              <div className="reply-content">{reply.content}</div>
            </div>
          ))}
        </div>
      )}

      {showForkDialog && (
        <div className="fork-dialog-overlay">
          <div className="fork-dialog">
            <div className="dialog-header">
              <h3>分叉这条消息</h3>
              <button
                className="dialog-close"
                onClick={() => setShowForkDialog(false)}
              >
                ×
              </button>
            </div>
            <div className="dialog-content">
              <p>确定要基于这条消息创建新的讨论吗？</p>
              <div className="fork-message-preview">
                <strong>原消息内容：</strong>
                <p>{message.content}</p>
              </div>
            </div>
            <div className="dialog-actions">
              <button
                className="secondary-btn"
                onClick={() => setShowForkDialog(false)}
              >
                取消
              </button>
              <button
                className="primary-btn"
                onClick={() => {
                  onFork(message.content)
                  setShowForkDialog(false)
                }}
              >
                确认分叉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageItem