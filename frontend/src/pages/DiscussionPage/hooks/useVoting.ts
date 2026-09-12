import { useState, useCallback } from 'react'

// 投票管理 Hook（Discussion页面专属）
// 单一职责：管理用户投票记录和简单投票操作
export const useVoting = (discussionId) => {
  // 用户投票记录
  const [userVotes, setUserVotes] = useState([])

  // 投票中状态
  const [isVoting, setIsVoting] = useState(false)

  // 错误状态
  const [error, setError] = useState(null)

  // 投票状态缓存
  const [voteCache, setVoteCache] = useState(new Map())

  // 切换投票状态（简化版投票功能）
  const toggleVote = useCallback(async (messageId, voteType = 'up') => {
    if (!messageId) return
    
    setIsVoting(true)
    setError(null)

    try {
      // 检查用户是否已经投票
      const existingVoteIndex = userVotes.findIndex(vote => vote.messageId === messageId)
      
      let updatedVotes
      if (existingVoteIndex >= 0) {
        // 如果已经投过票，则取消投票
        updatedVotes = userVotes.filter((_, index) => index !== existingVoteIndex)
      } else {
        // 如果没有投过票，则添加投票
        const newVote = {
          id: `vote-${Date.now()}`,
          messageId: messageId,
          voteType: voteType,
          userId: '当前用户',
          discussionId: discussionId,
          createdAt: new Date().toISOString()
        }
        updatedVotes = [...userVotes, newVote]
      }
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setUserVotes(updatedVotes)
      
      // 缓存投票状态
      setVoteCache(prev => new Map(prev).set(messageId, {
        voted: existingVoteIndex >= 0 ? false : true,
        voteType: voteType
      }))
      
      return updatedVotes
    } catch (err) {
      const errorMessage = err.message || '投票操作失败'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsVoting(false)
    }
  }, [userVotes, discussionId])

  // 检查用户是否已投票
  const hasUserVoted = useCallback((messageId) => {
    return voteCache.has(messageId) && voteCache.get(messageId).voted
  }, [voteCache])

  // 获取用户投票状态
  const getUserVote = useCallback((messageId) => {
    return voteCache.get(messageId) || null
  }, [voteCache])

  // 批量更新投票缓存
  const updateVoteCache = useCallback((votes) => {
    const newCache = new Map()
    votes.forEach(vote => {
      newCache.set(vote.messageId, {
        voted: true,
        voteType: vote.voteType
      })
    })
    setVoteCache(newCache)
  }, [])

  // 初始化用户投票数据
  const initUserVotes = useCallback(async (initialVotes = []) => {
    setIsVoting(true)
    setError(null)

    try {
      // 模拟API调用 - 加载用户投票记录
      await new Promise(resolve => setTimeout(resolve, 400))
      
      setUserVotes(initialVotes)
      
      // 更新缓存
      updateVoteCache(initialVotes)
    } catch (err) {
      const errorMessage = err.message || '加载投票数据失败'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsVoting(false)
    }
  }, [updateVoteCache])

  // 清除错误状态
  const clearError = () => {
    setError(null)
  }

  // 重置投票状态
  const resetVoting = () => {
    setUserVotes([])
    setVoteCache(new Map())
    setIsVoting(false)
    setError(null)
  }

  return {
    userVotes,         // 用户投票记录
    isVoting,          // 投票中状态
    error,             // 错误状态
    toggleVote,        // 切换投票状态
    hasUserVoted,      // 检查用户是否已投票
    getUserVote,       // 获取用户投票状态
    initUserVotes,     // 初始化用户投票数据
    clearError,        // 清除错误
    resetVoting        // 重置状态
  }
}