import { useState, useEffect } from 'react'

/**
 * 用户历史记录管理 Hook
 * 用于管理用户在当前讨论中的历史记录，包括发言记录、投票记录和编辑历史
 */
export const useUserHistory = (discussionId) => {
  const [userHistory, setUserHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 模拟的用户历史记录数据
  const mockUserHistory = [
    {
      id: 'history-1',
      type: 'message',
      content: '我认为这个方案有几个需要考虑的问题...',
      timestamp: '2024-01-15T10:30:00Z',
      discussionId: discussionId,
      messageId: 'msg-001'
    },
    {
      id: 'history-2',
      type: 'vote',
      voteType: 'upvote',
      timestamp: '2024-01-15T10:45:00Z',
      discussionId: discussionId,
      messageId: 'msg-002'
    },
    {
      id: 'history-3',
      type: 'edit',
      oldContent: '这是一个初步的想法',
      newContent: '这是一个经过深思熟虑的想法',
      timestamp: '2024-01-15T11:00:00Z',
      discussionId: discussionId,
      messageId: 'msg-003'
    }
  ]

  // 初始化用户历史记录
  const initUserHistory = (initialHistory = []) => {
    if (initialHistory.length > 0) {
      setUserHistory(initialHistory)
    } else {
      // 使用模拟数据作为默认值
      setUserHistory(mockUserHistory)
    }
  }

  // 获取用户历史记录
  const getUserHistory = () => {
    setLoading(true)
    try {
      // 这里可以替换为实际的API调用
      const history = userHistory.length > 0 ? userHistory : mockUserHistory
      setUserHistory(history)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('获取用户历史记录失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 添加历史记录
  const addHistoryRecord = (record) => {
    const newRecord = {
      ...record,
      id: `history-${Date.now()}`,
      timestamp: new Date().toISOString()
    }
    setUserHistory(prev => [newRecord, ...prev])
  }

  // 过滤特定类型的记录
  const filterByType = (type) => {
    return userHistory.filter(record => record.type === type)
  }

  // 按时间范围过滤
  const filterByTimeRange = (startDate, endDate) => {
    return userHistory.filter(record => {
      const recordDate = new Date(record.timestamp)
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  // 获取最近的记录
  const getRecentRecords = (limit = 10) => {
    return userHistory.slice(0, limit)
  }

  // 清除历史记录
  const clearHistory = () => {
    setUserHistory([])
  }

  // 统计记录数量
  const getStatistics = () => {
    const stats = {
      total: userHistory.length,
      messages: filterByType('message').length,
      votes: filterByType('vote').length,
      edits: filterByType('edit').length
    }
    return stats
  }

  // 组件挂载时获取历史记录
  useEffect(() => {
    if (discussionId && userHistory.length === 0) {
      getUserHistory()
    }
  }, [discussionId])

  return {
    userHistory,
    loading,
    error,
    initUserHistory,
    getUserHistory,
    addHistoryRecord,
    filterByType,
    filterByTimeRange,
    getRecentRecords,
    clearHistory,
    getStatistics
  }
}