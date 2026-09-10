# useMessages Hook 文档

## 概述

`useMessages` Hook 是为 DiscussionPage 设计的自定义 React Hook，负责管理讨论消息、评论、回复等功能。它提供了完整消息生命周期管理，包括发送、编辑、删除、回复、反应等操作。

## 功能特性

### 核心功能
- **消息管理**: 发送、编辑、删除消息
- **回复功能**: 支持对消息进行回复
- **消息反应**: 添加和更新消息反应（点赞、👍、💡等）
- **消息高亮**: 支持高亮重要消息
- **消息投票**: 支持对消息进行投票
- **滚动控制**: 自动滚动和手动滚动控制

### 状态管理
- **消息列表**: 存储所有消息数据
- **加载状态**: 处理异步操作的加载状态
- **错误状态**: 管理和清除错误信息
- **自动滚动**: 控制消息发送后的自动滚动行为

## API 接口

### 参数
- `discussionId` (string, optional): 当前讨论的ID，用于关联消息

### 返回值
```javascript
{
  // 数据状态
  messages: [],           // 消息列表
  loading: boolean,       // 加载状态
  error: string | null,   // 错误信息
  autoScroll: boolean,    // 自动滚动状态
  
  // 消息操作
  sendMessage: function,  // 发送消息
  editMessage: function,  // 编辑消息
  deleteMessage: function,// 删除消息
  replyToMessage: function,// 回复消息
  reactToMessage: function,// 添加消息反应
  highlightMessage: function, // 高亮/取消高亮消息
  voteMessage: function,  // 投票消息
  
  // 滚动控制
  scrollToBottom: function,     // 滚动到底部
  scrollToBottomNow: function,  // 立即滚动到底部
  toggleAutoScroll: function,  // 切换自动滚动
  
  // 状态管理
  initMessages: function,      // 初始化消息数据
  clearError: function,         // 清除错误
  resetMessages: function      // 重置消息状态
}
```

## 使用示例

### 基本使用
```javascript
const DiscussionPage = () => {
  const { messages, loading, sendMessage, error } = useMessages('discussion-123');
  
  const handleSend = (content) => {
    sendMessage({
      discussionId: 'discussion-123',
      content: content
    });
  };
  
  return (
    <div>
      {loading && <p>加载中...</p>}
      {error && <p className="error">{error}</p>}
      {/* 消息列表和输入框 */}
    </div>
  );
};
```

### 高级功能使用
```javascript
const MessageItem = ({ message }) => {
  const { 
    replyToMessage, 
    reactToMessage, 
    highlightMessage, 
    voteMessage 
  } = useMessages();
  
  const handleReply = (content) => {
    replyToMessage(message.id, { content });
  };
  
  const handleReact = (reactionType) => {
    reactToMessage(message.id, reactionType);
  };
  
  const handleVote = (voteType) => {
    voteMessage(message.id, voteType);
  };
  
  return (
    <div className={`message ${message.isHighlighted ? 'highlighted' : ''}`}>
      {/* 消息内容 */}
      <button onClick={() => highlightMessage(message.id)}>
        {message.isHighlighted ? '取消高亮' : '高亮'}
      </button>
      <button onClick={() => handleVote('up')}>👍</button>
      <button onClick={() => handleVote('down')}>👎</button>
      <button onClick={() => handleReact('👍')}>👍</button>
      <button onClick={() => handleReact('💡')}>💡</button>
      <button onClick={() => handleReply('回复内容')}>回复</button>
    </div>
  );
};
```

## 数据结构

### 消息对象结构
```javascript
{
  id: 'msg-123',              // 消息唯一ID
  type: 'text',              // 消息类型（text, image, system等）
  content: '消息内容',        // 消息正文
  author: '用户名',           // 作者姓名
  avatar: '头像URL',         // 用户头像
  createdAt: '2024-01-15T10:30:00Z', // 创建时间
  replyTo: 'parent-id',      // 回复的消息ID（null表示根消息）
  reactions: [               // 反应列表
    {
      type: '👍',           // 反应类型
      count: 3,             // 反应数量
      users: ['用户1', '用户2'] // 使用该反应的用户
    }
  ],
  votes: [                  // 投票列表
    {
      userId: 'user-123',   // 投票用户ID
      voteType: 'up',       // 投票类型（up/down）
      createdAt: '2024-01-15T10:30:00Z' // 投票时间
    }
  ],
  edited: false,            // 是否被编辑过
  isHighlighted: false       // 是否被高亮
}
```

### 初始化数据
```javascript
const mockMessages = [
  {
    id: 'msg-1',
    content: '第一条消息',
    author: '李华',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=李华',
    createdAt: '2024-01-15T09:45:00Z',
    replyTo: null,
    reactions: [
      { type: '👍', count: 3, users: ['王强', '当前用户'] }
    ],
    votes: [],
    edited: false,
    isHighlighted: false
  }
  // ... 更多消息
];
```

## 实现细节

### 异步操作处理
- 所有消息操作都通过 `async/await` 处理
- 包含加载状态和错误处理
- 模拟网络延迟（400-800ms）

### 滚动控制
- 自动滚动开关控制
- 消息发送后自动滚动到底部
- 支持手动滚动到底部
- 使用 `useRef` 获取DOM元素引用

### 数据同步
- 使用 `useState` 管理消息状态
- 通过 `useCallback` 缓存函数，避免不必要的重新渲染
- 消息更新时保持数据一致性

## 性能优化

- **函数记忆化**: 使用 `useCallback` 缓存所有回调函数
- **状态优化**: 避免不必要的重新渲染
- **滚动优化**: 使用 `requestAnimationFrame` 优化滚动性能
- **内存管理**: 及时清理不再需要的事件监听器

## 注意事项

1. **讨论ID处理**: Hook 支持传入讨论ID，如果没有传入则使用第一个参数作为讨论ID
2. **错误处理**: 所有异步操作都有完整的错误处理机制
3. **数据一致性**: 消息更新时确保数据结构的一致性
4. **滚动行为**: 在移动端可能需要调整滚动行为以获得更好的用户体验
5. **性能考虑**: 大量消息时可能需要实现虚拟滚动

## 未来扩展

- 支持多媒体消息（图片、视频等）
- 实现实时消息推送
- 添加消息搜索和筛选功能
- 支持消息批量操作
- 集成消息推送通知
- 添加消息版本历史记录