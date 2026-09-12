import { MessageItem } from '../MessageItem/MessageItem'
import './MessageList.css'

/**
 * 消息列表组件
 * 显示讨论中的所有消息，支持滚动加载
 */
export const MessageList = ({ handleMessageListScroll,messages, reactions, onReply, onReact, onEdit, onDelete, onFork }) => {


  return (
    <div className="messages-container" onScroll={handleMessageListScroll} >
      {messages.length === 0 ? (
        <div className="empty-messages">
          <div className="empty-icon">💬</div>
          <p className="empty-text">暂无讨论消息</p>
          <p className="empty-hint">开始发表第一条评论吧！</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.message_id}
            message={message}
            reactions={reactions}
            onReply={(content) => onReply(message.message_id, content)}
            onReact={(reactionType, content, operateType) => onReact(message.message_id, reactionType, content, operateType)}
            onEdit={() => onEdit(message.id)}
            onDelete={() => onDelete(message.id)}
            onFork={onFork}
          />
        ))
      )}
    </div>
  )
}

export default MessageList