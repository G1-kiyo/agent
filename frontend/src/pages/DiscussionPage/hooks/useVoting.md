# useVoting Hook 文档

## 概述

`useVoting` Hook 是为 DiscussionPage 设计的自定义 React Hook，负责管理用户的投票记录和简单的投票操作。根据文档要求，这个 Hook 已经被简化，移除了复杂的投票选项管理，专注于用户对消息的投票功能。

## 功能特性

### 核心功能
- **用户投票管理**: 记录用户对消息的投票
- **投票切换**: 支持对消息进行点赞/踩操作
- **投票状态检查**: 检查用户是否已经投票
- **投票缓存**: 使用缓存优化投票状态检查

### 状态管理
- **用户投票记录**: 存储用户的投票历史
- **投票中状态**: 处理异步操作的加载状态
- **错误状态**: 管理和清除错误信息
- **投票缓存**: 使用 Map 缓存投票状态，提高性能

## API 接口

### 参数
- `discussionId` (string, optional): 当前讨论的ID，用于关联投票

### 返回值
```javascript
{
  // 数据状态
  userVotes: [],        // 用户投票记录
  isVoting: boolean,    // 投票中状态
  error: string | null, // 错误信息
  
  // 投票操作
  toggleVote: function, // 切换投票状态
  hasUserVoted: function, // 检查用户是否已投票
  getUserVote: function,  // 获取用户投票状态
  
  // 状态管理
  initUserVotes: function, // 初始化用户投票数据
  clearError: function,     // 清除错误
  resetVoting: function     // 重置投票状态
}
```

## 使用示例

### 基本使用
```javascript
const DiscussionPage = () => {
  const { userVotes, toggleVote, isVoting, error } = useVoting('discussion-123');
  
  const handleVote = (messageId, voteType = 'up') => {
    toggleVote(messageId, voteType);
  };
  
  return (
    <div>
      {isVoting && <p>处理中...</p>}
      {error && <p className="error">{error}</p>}
      {/* 显示投票按钮 */}
    </div>
  );
};
```

### 消息组件中使用
```javascript
const MessageItem = ({ message }) => {
  const { 
    hasUserVoted, 
    getUserVote, 
    toggleVote, 
    isVoting 
  } = useVoting();
  
  const userVoteStatus = getUserVote(message.id);
  const hasVoted = hasUserVoted(message.id);
  
  const handleVote = (voteType) => {
    if (!isVoting) {
      toggleVote(message.id, voteType);
    }
  };
  
  return (
    <div className="message">
      {/* 消息内容 */}
      <div className="vote-section">
        <button 
          onClick={() => handleVote('up')}
          className={`vote-button ${hasVoted && userVoteStatus?.voteType === 'up' ? 'voted' : ''}`}
          disabled={isVoting}
        >
          👍 {message.votes?.filter(v => v.voteType === 'up')?.length || 0}
        </button>
        <button 
          onClick={() => handleVote('down')}
          className={`vote-button ${hasVoted && userVoteStatus?.voteType === 'down' ? 'voted' : ''}`}
          disabled={isVoting}
        >
          👎 {message.votes?.filter(v => v.voteType === 'down')?.length || 0}
        </button>
      </div>
    </div>
  );
};
```

### 高级用法
```javascript
const VotingStats = () => {
  const { userVotes } = useVoting();
  
  // 统计投票数据
  const voteStats = userVotes.reduce((stats, vote) => {
    stats[vote.voteType] = (stats[vote.voteType] || 0) + 1;
    return stats;
  }, { up: 0, down: 0 });
  
  return (
    <div className="voting-stats">
      <p>点赞: {voteStats.up}</p>
      <p>踩: {voteStats.down}</p>
    </div>
  );
};
```

## 数据结构

### 用户投票记录
```javascript
[
  {
    id: 'vote-12345',          // 投票记录ID
    messageId: 'msg-67890',    // 被投票的消息ID
    voteType: 'up',             // 投票类型（up/down）
    userId: '当前用户',         // 投票用户
    discussionId: 'discussion-123', // 关联的讨论ID
    createdAt: '2024-01-15T10:30:00Z' // 投票时间
  }
]
```

### 投票缓存
```javascript
// 使用 Map 缓存，键为消息ID，值为投票状态
Map {
  'msg-1' => { voted: true, voteType: 'up' },
  'msg-2' => { voted: false, voteType: 'down' }
}
```

## 实现细节

### 异步操作处理
- 所有投票操作都通过 `async/await` 处理
- 包含加载状态和错误处理
- 模拟网络延迟（300-400ms）

### 缓存优化
- 使用 `Map` 数据结构缓存投票状态
- 避免重复的状态检查
- 提高性能，减少不必要的重新渲染

### 数据同步
- 使用 `useState` 管理投票状态
- 通过 `useCallback` 缓存函数，避免不必要的重新渲染
- 投票更新时保持数据一致性

## 性能优化

- **函数记忆化**: 使用 `useCallback` 缓存所有回调函数
- **状态缓存**: 使用 Map 缓存投票状态，提高查询性能
- **批量更新**: 支持批量更新投票缓存
- **内存管理**: 及时清理不再需要的缓存数据

## 注意事项

1. **讨论ID处理**: Hook 支持传入讨论ID，如果没有传入则使用第一个参数作为讨论ID
2. **错误处理**: 所有异步操作都有完整的错误处理机制
3. **投票状态**: 支持投票的增删改查，保持数据一致性
4. **缓存更新**: 投票操作后自动更新缓存，确保状态同步
5. **防重复操作**: 通过 `isVoting` 状态防止重复投票

## 与其他 Hook 的集成

### 与 useMessages 集成
```javascript
const MessageItem = ({ message }) => {
  const { toggleVote } = useVoting();
  const { voteMessage } = useMessages();
  
  const handleVote = (voteType) => {
    // 同时更新投票状态和消息投票
    toggleVote(message.id, voteType);
    voteMessage(message.id, voteType);
  };
};
```

### 状态同步
- 投票状态与消息投票状态需要保持同步
- 在组件中同时使用两个 Hook 来管理相关状态

## 未来扩展

- 支持更多投票类型（如收藏、标记等）
- 实现实时投票推送
- 添加投票历史记录
- 支持投票数据分析
- 集成投票通知功能