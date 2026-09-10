import { useState, useCallback, useRef } from 'react'
import { mockMessages } from '../mockData'
import { discussionApi } from '../../../api/discussion'

// 消息管理 Hook（Discussion页面专属）
// 单一职责：管理讨论消息、评论、回复等
export const useMessages = () => {
  // 消息列表
  const [messages, setMessages] = useState([])

  // 消息统计
  const [pageSize, setPageSize] = useState(10)
  const [lastMessageId, setLastMessageId] = useState(null)


  // 加载状态
  const [loading, setLoading] = useState(false)

  // 错误状态
  const [error, setError] = useState(null)

  // 自动滚动状态
  const [autoScroll, setAutoScroll] = useState(true)

  // 滚动到底部的引用
  const messagesEndRef = useRef(null)
  const messageContainerRef = useRef(null)


  // 滚动到列表的第一条信息
  const scrollToTargetIndex = useCallback((index) => {
    console.log("scroll", index)
    const messageItems = document.querySelectorAll(".messages-container .message-item")
    const container = document.querySelector(".messages-container")
    const mainPanel = document.querySelector(".main-panel")
    if (messageItems.length > 0) {
      const firstEl = messageItems[index]
      const firstElTop = firstEl.getBoundingClientRect().top
      const containerTop = container.getBoundingClientRect().top
      const mainPanelScrollTop = mainPanel.scrollTop
      const containerScrollTop = container.scrollTop
      const pos = firstElTop - containerTop + containerScrollTop - 20
      container.scrollTop = pos
      console.log("conatinertop", container.getBoundingClientRect())
      mainPanel.scrollTop = containerTop + mainPanelScrollTop - 24
    }
  }, [])


  // 切换自动滚动
  const toggleAutoScroll = useCallback(() => {
    setAutoScroll(prev => !prev)
  }, [])

  // 发送消息
  const sendMessage = useCallback(async (discussionId, content) => {

    try {
      await discussionApi.sendMessage({ discussion_id: discussionId, content })
      setTimeout(() => scrollToTargetIndex(0), 100)
    } catch (err) {
      console.log("Failed to send message:", err)
    }
  }, [scrollToTargetIndex])

  // 回复消息
  const replyToMessage = useCallback(async (discussionId, messageId, content) => {
    try {
      await discussionApi.replyMessage({ discussion_id: discussionId, message_id: messageId, content })
    } catch (err) {
      console.log("Failed to reply message:", err)
    }
  }, [])

  // 添加消息反应
  const reactToMessage = useCallback(async (discussionId, messageId, reactionType, content, operateType) => {
    try {
      // 模拟API调用
      await discussionApi.reactMessage({
        discussion_id: discussionId,
        message_id: messageId,
        type: reactionType,
        content,
        operate_type: operateType
      })

    } catch (err) {
      console.log("Failed to react message:", err)
    }
  }, [])

  // 编辑消息
  const editMessage = useCallback(async (messageId, newContent) => {
    setError(null)

    try {
      // 模拟API调用
      const updatedMessage = {
        id: messageId,
        content: newContent,
        editedAt: new Date().toISOString(),
        edited: true
      }

      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 400))

      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, ...updatedMessage } : msg
      ))
      return updatedMessage
    } catch (err) {
      const errorMessage = err.message || '编辑消息失败'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // 删除消息
  const deleteMessage = useCallback(async (messageId) => {
    setError(null)

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 400))

      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      return true
    } catch (err) {
      const errorMessage = err.message || '删除消息失败'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // 高亮消息
  const highlightMessage = useCallback((messageId) => {
    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, isHighlighted: !msg.isHighlighted } : msg
    ))
  }, [])

  // 投票消息
  const voteMessage = useCallback(async (messageId, voteType) => {
    setError(null)

    try {
      // 模拟API调用
      const updatedMessage = await new Promise(resolve => {
        setTimeout(() => {
          const message = messages.find(msg => msg.id === messageId)
          if (!message) return message

          const existingVote = message.votes?.find(v => v.userId === '当前用户')

          let updatedVotes = message.votes || []
          if (existingVote) {
            updatedVotes = updatedVotes.filter(v => v.userId !== '当前用户')
          } else {
            updatedVotes.push({
              userId: '当前用户',
              voteType,
              createdAt: new Date().toISOString()
            })
          }

          resolve({
            ...message,
            votes: updatedVotes
          })
        }, 300)
      })

      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? updatedMessage : msg
      ))
      return updatedMessage
    } catch (err) {
      const errorMessage = err.message || '投票失败'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [messages])


  // 初始化消息数据
  const initMessages = useCallback(async (topicId, isInit = true) => {
    console.log("start", loading, isInit, lastMessageId)
    if (loading || (!isInit && !lastMessageId)) return
    setLoading(true)
    try {
      // 模拟API调用 - 加载mock数据
      const messageResult = await discussionApi.messageList({
        discussion_id: topicId,
        last_message_id: lastMessageId,
        page_size: pageSize
      })
      const { messages, page_size, last_message_id, current_user } = messageResult
      // console.log("init messages", messages)
      // const newMessages = messages.map((m) => {
      //   console.log("map", m)
      //   m.reactions = groupbyReactionType(m.reactions)
      //   return m
      // })
      // console.log("new message", newMessages)
      console.log("id", lastMessageId, last_message_id)
      setMessages((prev) => {
        return isInit ? messages : [...prev, ...messages]
      })
      setPageSize(page_size)
      setLastMessageId(last_message_id)

    } catch (err) {
      console.log("Failed to init messages: ", err)
    } finally {
      setLoading(false)
    }
  }, [loading, lastMessageId])
  console.log("outer", lastMessageId)


  return {
    messages,           // 消息列表
    lastMessageId,      // 最后一条消息
    loading,            // 加载状态
    error,              // 错误状态
    autoScroll,         // 自动滚动状态
    setMessages,        // 更新消息
    sendMessage,        // 发送消息
    editMessage,        // 编辑消息
    deleteMessage,      // 删除消息
    reactToMessage,     // 添加反应
    replyToMessage,     // 回复消息
    highlightMessage,   // 高亮消息
    voteMessage,        // 投票消息
    initMessages,      // 初始化消息数据
    toggleAutoScroll,  // 切换自动滚动
    scrollToTargetIndex, // 滚动到指定消息
  }
}