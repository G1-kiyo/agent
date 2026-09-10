/**
 * 协同讨论页面内容。
 * 采用双栏布局：左侧主讨论区，右侧历史话题列表。
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { useDiscussionState, useMessages, useVoting, useForkDiscussion, useUserHistory } from './hooks'
import { DiscussionHeader, MessageList, MessageInput, HistoricalTopics, UserHistory, ForkDialog, AIDebateGenerator } from './components'
import { mockTopics } from './components/HistoricalTopics/mockData'
import './DiscussionPage.css'
import { mockDiscussion, mockMessages, mockVotes, mockForkHistory, mockLoadingStates, mockErrors } from './mockData'
import { discussionApi } from '../../api/discussion'
import BatchMsgScheduler from '../../utils/batchmsgscheduler'
import WebsocketService from '../../utils/websocketservice'
import NodeOperator from '../../utils/nodeoperator'
import { useBoundStore } from '../../store'
import { GlobalAlert } from '../../components'
import { ReactionOperateType, ForkType } from './const'

// 查询参数
const discussionId = new URLSearchParams(window.location.search).get("discussion_id")
export const DiscussionPage = () => {
  // 使用讨论状态钩子
  const { discussion, error, loading, getDiscussionById, historicalTopics, topicListStats, filterCondition, updateFilterCondition, resetFilterCondition, onCreateTopic, getHistoricalTopics } = useDiscussionState()
  const { messages, lastMessageId, setMessages, loading: messagesLoading, sendMessage, replyToMessage, reactToMessage, scrollToTargetIndex, initMessages } = useMessages()
  const { userVotes, toggleVote, isVoting, initUserVotes } = useVoting()
  const { forkDiscussion, isForking, forkHistory, initForkHistory } = useForkDiscussion()
  const { userHistory, initUserHistory } = useUserHistory()
  const [reactions, setReactions] = useState([])
  const user = useBoundStore((state) => state.user)
  


  // 滚动监听
  const messageListRef = useRef(null)

  // 消息渲染缓冲
  const messageSchedulerRef = useRef(null)

  // 节点操作
  const messageNodeOperatorRef = useRef(null)

  // disucssion
  const discussionRef = useRef(null)

  // debounce

  useEffect(() => {
    discussionRef.current = discussion
  }, [discussion])
  console.log("触发重新渲染")




  // 初始化数据
  useEffect(() => {
    getHistoricalTopics({
      filterCategory: filterCondition.filterCategory,
      sortBy: filterCondition.sortBy,
      searchTerm: filterCondition.searchTerm,
      pageSize: topicListStats.pageSize,
      pageNum: topicListStats.pageNum
    })
    initWebsocketConnection()
    initMessageScheduler()
    getReactions()
  }, [])

  useEffect(() => {
    getDiscussionById(discussionId)
  }, [discussionId])

  useEffect(() => {
    if (discussion?.discussion_id) {
      initMessages(discussion.discussion_id, true)
    }
  }, [discussion])

  useEffect(() => {
    messageNodeOperatorRef.current = new NodeOperator(messages)
  }, [messages])

  // 创建webscoket连接
  const initWebsocketConnection = () => {
    const instance = WebsocketService.getInstance()
    instance.initializeWebsocket()
    instance.on("notifynewmessage", handleNewMessage)
    instance.on("notifynewreply", updateReplyById)
    instance.on("notifynewreaction", (data) => updateReactionById(ReactionOperateType.CONFIRM, data))
    instance.on("notifydeletereaction", (data) => updateReactionById(ReactionOperateType.CANCEL, data))
    instance.on("reporterror", handleWebsocketError)
  }
  // 初始化批量消息渲染器
  const initMessageScheduler = () => {
    messageSchedulerRef.current = new BatchMsgScheduler()
    messageSchedulerRef.current.on(onNewMessageRender)
  }
  // 监听消息容器滚动
  const handleMessageListScroll = async (e) => {
    const scrollHeight = e.target.scrollHeight
    const scrollTop = e.target.scrollTop
    const clientHeight = e.target.clientHeight
    console.log("scroll", e, scrollHeight, scrollTop, clientHeight, scrollTop + clientHeight >= scrollHeight)
    if (scrollTop + clientHeight + 20 >= scrollHeight) {
      await initMessages(discussion.discussion_id, false)
    }
  }

  // 监听新消息
  const handleNewMessage = (data) => {
    console.log("newmessage", data)
    if (Array.isArray(data)) {
      const messages = []
      data.forEach((d) => {
        const { id, content, create_at, user_id, username, discussion_id } = d || {}
        const newMessage = {
          id,
          is_host: false,
          username,
          create_at,
          content,
          reactions: [],
          replies: []
        }
        messages.push(newMessage)
      })
      messageSchedulerRef.current.add(messages)
    }

  }

  // 渲染响应
  const onNewMessageRender = (messages) => {
    setMessages((prev) => [...messages, ...prev])
    GlobalAlert.info(
      <div>
        新增
        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{messages.length}</span>
        条信息，
        <span
          onClick={() => { scrollToTargetIndex(messages.length - 1) }}
          style={{
            color: '#52c41a',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          点击查看
        </span>
      </div>,
      0
    )
  }

  // 监听新回复
  const updateReplyById = (data) => {
    if (Array.isArray(data)) {
      let newMessagesList = []
      data.forEach((d) => {
        const { reply_id, content, create_at, username, message_id } = d || {}
        newMessagesList = messageNodeOperatorRef.current.add(d, "message_id", "message_id", "replies", 1)
      })

      setMessages(newMessagesList)
    }
  }
  // 监听新reaction
  const updateReactionById = (operateType, data) => {

    const updateFn = (currentNode, newVal) => {
      const reactions = currentNode?.reactions
      if (reactions?.length > 0) {
        const targetReaction = reactions.find((r) => r.reaction_id === data.reaction_id)
        if (targetReaction) {
          targetReaction.count = targetReaction.count++
        } else {
          reactions.push({ ...newVal, count: 1 })
        }
      } else {
        console.log("add", newVal)
        reactions.push({ ...newVal, count: 1 })
      }
    }
    const delFn = (currentNode, newVal) => {
      const reactions = currentNode?.reactions
      if (reactions?.length > 0) {
        const targetReaction = reactions.find((r) => r.reaction_id === newVal.reaction_id)
        if (targetReaction) {
          if (targetReaction.count === 1) {
            reactions = reactions.filter((r) => r.reaction_id !== newVal.reaction_id)
          } else {
            targetReaction.count = targetReaction.count--
          }

        }
      }
    }
    if (Array.isArray(data)) {
      let newMessagesList = []
      data.forEach((d) => {
        const { reaction_id } = d || {}
        if (operateType === ReactionOperateType.CONFIRM) {
          newMessagesList = messageNodeOperatorRef.current.add(d, "message_id", "message_id", "reactions", 1)
        } else {
          newMessagesList = messageNodeOperatorRef.current.remove(reaction_id, "reaction_id", "reactions", 2)
        }
        // newMessagesList = messageNodeOperatorRef.current.update(
        //   reaction_id,
        //   operateType === ReactionOperateType.CONFIRM ? (node) => updateFn(node, d) : (node) => delFn(node, d),
        //   "reaction_id",
        //   "reactions",
        //   1
        // )
      })

      setMessages(newMessagesList)
    }
  }

  // 监听websocket错误事件
  const handleWebsocketError = (data) => {
    console.log(`error code: ${data.code} error detail: ${data.reason}`)
    GlobalAlert.error("error")
  }


  // 获取reactions列表
  const getReactions = async () => {
    try {
      const reactions = await discussionApi.reactions()
      setReactions(reactions)
    } catch (err) {
      console.log("Failed to get reactions:", err)
    }
  }

  // 状态管理
  const [showForkDialog, setShowForkDialog] = useState(false)
  const [activePoll, setActivePoll] = useState(null)
  const [selectedTopic, setSelectedTopic] = useState(null)

  // 处理分享讨论
  const handleShareDiscussion = () => {
    if (discussion && discussion.id) {
      const shareUrl = `${window.location.origin}/discussion/${discussion.id}`
      if (navigator.share) {
        navigator.share({
          title: discussion.title,
          text: discussion.description,
          url: shareUrl
        })
      } else {
        // 复制到剪贴板
        navigator.clipboard.writeText(shareUrl)
        alert('讨论链接已复制到剪贴板')
      }
    }
  }

  // 处理分叉提交
  const handleForkSubmit = async (forkData) => {
    try {
      await forkDiscussion(discussion.id, forkData)
      setShowForkDialog(false)
    } catch (error) {
      console.error('分叉失败:', error)
    }
  }

  // 处理消息分叉
  const handleMessageFork = async (messageContent) => {
    try {
      const forkDiscussion = await discussionApi.fork({
        type: ForkType.DISCUSSION,
        discussion_id: discussion?.discussion_id,
        content: messageContent
      })
      handleTopicSelect(forkDiscussion)
      getHistoricalTopics({
        filterCategory: filterCondition.filterCategory,
        sortBy: filterCondition.sortBy,
        searchTerm: filterCondition.searchTerm,
        pageSize: topicListStats.pageSize,
        pageNum: topicListStats.pageNum
      })

      // 这里可以跳转到新讨论页面
      // navigate(`/discussion/${newDiscussion.id}`)
    } catch (error) {
      console.error('消息分叉失败:', error)
    }
  }

  // 处理切换历史话题
  const handleTopicSelect = (topic) => {
    getDiscussionById(topic.id)
    // 这里可以加载新话题的消息数据
  }

  // 处理消息编辑
  const editMessage = (messageId, newContent) => {
    console.log('编辑消息:', messageId, newContent)
    // 实现消息编辑逻辑
  }

  // 处理消息删除
  const deleteMessage = (messageId) => {
    console.log('删除消息:', messageId)
    // 实现消息删除逻辑
  }



  return (
    <div className="discussion-panel">
      <div className="discussion-layout">
        {/* 左侧内容区域 */}
        <div className="discussion-main">
          {discussion && (
            <>
              <DiscussionHeader discussion={discussion} loading={loading} error={error} />

              {/* AI辩论生成器 - 独立组件 */}
              {discussion && (
                <AIDebateGenerator
                  topicId={discussion?.discussion_id}
                  onGenerate={(debateMessages) => {
                    // 处理AI生成的辩论消息
                    console.log('AI辩论生成完成:', debateMessages)
                  }}
                />
              )}

              <div className="message-container">
                <MessageList
                  handleMessageListScroll={handleMessageListScroll}
                  messages={messages}
                  reactions={reactions}
                  onReply={(messageId, content) => { console.log("reply", discussion?.discussion_id, messageId); replyToMessage(discussion?.discussion_id, messageId, content) }}
                  onReact={(messageId, reactionType, content, operateType) => reactToMessage(discussion?.discussion_id, messageId, reactionType, content, operateType)}
                  onEdit={(messageId) => {
                    editMessage(messageId)
                  }}
                  onDelete={(messageId) => {
                    deleteMessage(messageId)
                  }}
                  onFork={handleMessageFork}
                />

                <MessageInput
                  onSubmit={(content) => sendMessage(discussion?.discussion_id, content)}
                  placeholder="发表你的观点..."
                  userAvatar="https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser"
                  userName="当前用户"
                  showUserAvatar={true}
                />
              </div>
            </>
          )}

          {loading && !discussion && (
            <div className="loading-container">
              <p>正在加载讨论内容...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p>{error}</p>
              <button onClick={() => getDiscussionById()}>重新加载</button>
            </div>
          )}

          {!discussion && !loading && !error && (
            <div className="discussion-placeholder">
              <div className="placeholder-content">
                <h3>暂无讨论内容</h3>
                <p>请从右侧选择一个历史话题或创建新的讨论</p>
              </div>
            </div>
          )}
        </div>

        {/* 右侧边栏 */}
        <div className="discussion-sidebar">
          <HistoricalTopics
            topics={historicalTopics}
            topicListStats={topicListStats}
            filterCondition={filterCondition}
            resetFilterCondition={resetFilterCondition}
            updateFilterCondition={updateFilterCondition}
            onSelectTopic={handleTopicSelect}
            onCreateTopic={onCreateTopic}
          />

          <UserHistory
            userVotes={userVotes}
            messages={messages}
          />
        </div>
      </div>

      {showForkDialog && (
        <ForkDialog
          discussion={discussion}
          onSubmit={handleForkSubmit}
          onClose={() => setShowForkDialog(false)}
          isSubmitting={isForking}
        />
      )}
    </div>
  )
}

export default DiscussionPage