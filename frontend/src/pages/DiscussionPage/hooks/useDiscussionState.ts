import { useState, useCallback} from 'react'
import { discussionApi } from '@api/index'
import { mockDiscussion } from '../mockData'
import { DiscussionCategory, DiscussionSort } from "../const"
import { useDebounce } from '@hooks/index'

// 讨论状态管理 Hook（Discussion页面专属）
// 单一职责：管理讨论页面状态、加载状态、错误状态和讨论操作
// 重构目标：支持多状态管理、性能优化、历史话题和AI辩论功能
export const useDiscussionState = () => {
  // ==================== 讨论状态 ====================
  const [discussion, setDiscussion] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  // 话题列表基本信息
  const [topicListStats, setTopicListStats] = useState({
    pageSize: 10,
    pageNum: 1,
    total: 0,
    filtered: 0
  })
  // 历史话题列表
  const [historicalTopics, setHistoricalTopics] = useState([])

  // 话题列表查询条件
  const [filterCondition, setFilterCondition] = useState({
    filterCategory: DiscussionCategory.ALL, // 默认分类
    sortBy: DiscussionSort.CREATE_AT, // 默认排序
    searchTerm: '', // 默认搜索词
  })

  // 监听查询条件变更
  const updateFilterCondition = useCallback((key, value) => {
    console.log("fliter",key,value)
    setFilterCondition(prev => ({ ...prev, [key]: value }))
    getHistoricalTopics({ ...filterCondition, [key]: value, pageSize: topicListStats.pageSize, pageNum: 1, })
  }, [filterCondition, topicListStats.pageSize])

  // 重置查询条件
  const resetFilterCondition = useCallback(() => {
    setFilterCondition({
      filterCategory: DiscussionCategory.ALL,
      sortBy: DiscussionSort.CREATE_AT,
      searchTerm: '',
    })
    getHistoricalTopics({ filterCategory: DiscussionCategory.ALL, sortBy: DiscussionSort.CREATE_AT, searchTerm: '', pageSize: topicListStats.pageSize, pageNum: 1 })
  }, [])

  // 请求历史话题列表
  const getHistoricalTopics = useDebounce(async ({ filterCategory, sortBy, searchTerm, pageSize, pageNum = 1 }) => {
    const searchParams = {
      category: filterCategory,
      sortby: sortBy,
      search_title: searchTerm,
      page_size: pageSize,
      page_num: pageNum
    }
    try {
      const historicalTopicsInfo = await discussionApi.discussionList(searchParams)
      const { discussion_list, page_size, page_num, total, filter_num } = historicalTopicsInfo
      setHistoricalTopics(discussion_list)
      setTopicListStats({
        pageSize: page_size,
        pageNum: page_num,
        total,
        filtered: filter_num
      })

    } catch (error) {
      console.log("Failed to get discussion_list", error)
    }
  }, { isImmediate: true, delay: 1000 })
  // 获取讨论详情
  const getDiscussionById = useCallback(async (id?) => {
    setLoading(true)
    setError(null)

    try {
      // 模拟API调用 - 使用更丰富的mock数据
      const discussionDetail = await discussionApi.detail(id)

      // 使用mock数据
      setDiscussion(discussionDetail)
      return mockDiscussion
    } catch (err) {
      const errorMessage = err.message || '获取讨论详情失败'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // 确定创建新话题
  const onCreateTopic = async (discussionInfo) => {
    // 校验提交的信息
    for (let field in discussionInfo) {
      if (!discussionInfo[field]) {
        console.log("validatefield", field)
        return
      }
    }

    try {
      await discussionApi.create(discussionInfo)
      setTimeout(() => {
        getHistoricalTopics({ ...filterCondition, pageSize: 10, pageNum: 1 })
        getDiscussionById()
      }, 1000)
    } catch (error) {
      console.log("Failed to create topic:", error)
    }
  }


  // ==================== 投票状态 ====================
  const [userVotes, setUserVotes] = useState(new Map()) // 使用Map优化投票查询性能
  const [loadingVotes, setLoadingVotes] = useState(false)

  // ==================== AI辩论状态 ====================
  const [aiDebateActive, setAiDebateActive] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [debateGenerated, setDebateGenerated] = useState(false)




  // ==================== 投票管理方法 ====================

  // 加载投票状态
  const loadVotes = useCallback(async (messageIds) => {
    setLoadingVotes(true)

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300))

      const newVotes = new Map()
      messageIds.forEach(id => {
        newVotes.set(id, Math.floor(Math.random() * 10))
      })
      setUserVotes(newVotes)
    } catch (err) {
      console.error('加载投票失败:', err)
    } finally {
      setLoadingVotes(false)
    }
  }, [])

  // 投票
  const voteMessage = useCallback((messageId, direction) => {
    setUserVotes(prevVotes => {
      const newVotes = new Map(prevVotes)
      const currentVote = newVotes.get(messageId) || 0
      newVotes.set(messageId, currentVote + direction)
      return newVotes
    })
  }, [])

  // 取消投票
  const unvoteMessage = useCallback((messageId) => {
    setUserVotes(prevVotes => {
      const newVotes = new Map(prevVotes)
      newVotes.delete(messageId)
      return newVotes
    })
  }, [])



  // ==================== AI辩论管理方法 ====================

  // 启动AI辩论
  const startAIDebate = useCallback(async (topic) => {
    setIsGenerating(true)
    setAiDebateActive(true)
    setDebateGenerated(false)

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000))

      setDebateGenerated(true)
    } catch (err) {
      console.error('启动AI辩论失败:', err)
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }, [])

  // 停止AI辩论
  const stopAIDebate = useCallback(() => {
    setAiDebateActive(false)
    setIsGenerating(false)
  }, [])

  // 生成辩论内容
  const generateDebateContent = useCallback(() => {
    // 实际项目中应该调用AI服务生成辩论内容
    return [
      {
        id: `debate-1`,
        role: '正方',
        content: '基于现有数据，这个观点有充分的证据支持...',
        createdAt: new Date().toISOString()
      },
      {
        id: `debate-2`,
        role: '反方',
        content: '我认为这个观点存在一些局限性，需要重新考虑...',
        createdAt: new Date().toISOString()
      }
    ]
  }, [])

  // ==================== 通用管理方法 ====================

  // 清除错误状态
  const clearError = useCallback(() => {
    setError(null)
  }, [])


  // ==================== 返回状态和方法 ====================
  return {
    // 讨论状态
    discussion,
    isCreating,
    getDiscussionById,

    // 投票状态
    userVotes,
    loadingVotes,
    loadVotes,
    voteMessage,
    unvoteMessage,

    // 历史话题状态
    historicalTopics,
    topicListStats,
    filterCondition,
    updateFilterCondition,
    resetFilterCondition,
    onCreateTopic,
    getHistoricalTopics,

    // AI辩论状态
    aiDebateActive,
    isGenerating,
    debateGenerated,
    startAIDebate,
    stopAIDebate,
    generateDebateContent,

    // 通用状态
    loading,
    error,
    clearError,
  }
}