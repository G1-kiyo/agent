import { useState, useEffect, useRef } from 'react'
import { useTypewriter } from '../../../hooks'
import { mockRagAnswer } from '../components/DocumentList/data/mockData'
import { knowledgeApi } from '../../../api'
import { useSSEStream } from '../../../hooks'

// RAG 问答对话 hook（知识库页面专属）
// 单一职责：管理问答会话与流式回答（输入、会话历史、流式输出、发起检索）
// 与文档列表/上传逻辑解耦，仅关注「问 → 答」流程
export const useRagConversation = () => {
  const [query, setQuery] = useState('')
  const [conversations, setConversations] = useState([]) // [{role, content, sources}]
  const [isQuerying, setIsQuerying] = useState(false)
  const currentConversationId = useRef(null)

  // 流式输出复用通用打字机 hook
  const { text: streamingAnswer, append, reset } = useTypewriter()
  const { read } = useSSEStream();

  useEffect(() => {
    if (streamingAnswer) {
      // 判断在过去conversation里遍历查找id相同的con，找到的话拼接最新的回答，没找到新建一个aiconversation对象，最后返回新的列表，设置id为当前id
      setConversations((prev) => {
        if (currentConversationId.current) {
          return prev.map((con) => {
            if (currentConversationId.current === con.id) {
              return {
                ...con,
                content: streamingAnswer
              }

            }
            return con
          })
        } else {
          const id = `${Date.now()}_ai`
          currentConversationId.current = id
          const newConversation = { id, role: 'assistant', content: streamingAnswer, sources: [] }
          return [...prev, newConversation]
        }
      })

    }
  }, [streamingAnswer])
  // 发起 RAG 检索（当前 mock 流式，后端就绪后切换为真实 SSE）
  const executeRagQuery = async () => {
    console.log("isQuerying", isQuerying)
    if (isQuerying) {
      knowledgeApi.cancelRag()
      setIsQuerying(false)
      return
    }
    const q = query.trim()
    if (!q) return

    // 追加用户问题
    setConversations((prev) => [...prev, { id: `${Date.now()}_user`, role: 'user', content: q, sources: [] }])
    setIsQuerying(true)
    reset()
    currentConversationId.current = null
    // TODO: 后端就绪后切换为真实 SSE 请求
    const res = await knowledgeApi.rag(query)

    await read(res, (data) => {
      console.log("callbackdata>>", data)
      const content = data?.content
      append(content)
      console.log("111")
    })

    // mock：用打字机逐字输出回答
    // append(mockRagAnswer.content)
    // await new Promise((resolve) => setTimeout(resolve, 1800))

    // 追加 assistant 回答到历史
    // reset()
    setIsQuerying(false)
  }

  return {
    query,
    setQuery,
    conversations,
    streamingAnswer,
    isQuerying,
    executeRagQuery
  }
}
