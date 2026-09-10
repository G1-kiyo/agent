import { useState, useCallback } from 'react'
import { mockForkHistory } from '../mockData'

// 分叉讨论 Hook（Discussion页面专属）
// 单一职责：管理分叉讨论的创建、历史记录、关联关系等
export const useForkDiscussion = () => {
  // 分叉历史
  const [forkHistory, setForkHistory] = useState([])

  // 分叉中状态
  const [isForking, setIsForking] = useState(false)

  // 错误状态
  const [error, setError] = useState(null)

  // 分叉讨论
  const forkDiscussion = useCallback(async (originalTopic, forkData) => {
    setIsForking(true)
    setError(null)

    try {
      // 模拟API调用
      const newFork = await new Promise(resolve => {
        setTimeout(() => {
          resolve({
            id: `fork-${Date.now()}`,
            title: forkData.title,
            description: forkData.description,
            fromTopic: originalTopic.id,
            createdAt: new Date().toISOString(),
            creator: '当前用户',
            participantCount: 1,
            messageCount: 1,
            tags: forkData.tags || [],
            isPublic: forkData.isPublic || true
          })
        }, 800)
      })

      // 更新分叉历史
      setForkHistory(prev => [...prev, newFork])
      
      return newFork
    } catch (err) {
      const errorMessage = err.message || '分叉讨论失败'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsForking(false)
    }
  }, [])

  // 初始化分叉数据
  const initForkHistory = useCallback(async () => {
    setIsForking(true)
    setError(null)

    try {
      // 模拟API调用 - 加载mock分叉数据
      await new Promise(resolve => setTimeout(resolve, 600))
      
      setForkHistory(mockForkHistory)
    } catch (err) {
      const errorMessage = err.message || '加载分叉历史失败'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsForking(false)
    }
  }, [])

  // 获取特定主题的分叉讨论
  const getTopicForks = useCallback((topicId) => {
    return forkHistory.filter(fork => fork.fromTopic === topicId)
  }, [forkHistory])

  // 获取分叉路径
  const getForkPath = useCallback((forkId) => {
    const path = []
    let currentId = forkId
    
    // 查找当前分叉的所有祖先
    while (currentId) {
      const fork = forkHistory.find(f => f.id === currentId)
      if (fork) {
        path.unshift(fork)
        currentId = fork.fromTopic
      } else {
        break
      }
    }
    
    return path
  }, [forkHistory])

  // 清除错误状态
  const clearError = () => {
    setError(null)
  }

  return {
    forkDiscussion,    // 分叉讨论
    isForking,         // 分叉中状态
    forkHistory,       // 分叉历史
    error,             // 错误状态
    getTopicForks,     // 获取特定主题的分叉讨论
    getForkPath,       // 获取分叉路径
    initForkHistory,  // 初始化分叉历史
    clearError         // 清除错误
  }
}