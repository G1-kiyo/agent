import { useRef } from 'react'

// 通用 SSE 流式读取 hook
// 单一职责：从 fetch 响应中逐块解析 SSE `data:` 事件（按 \n\n 分帧、缓冲不完整片段）
// 跨页面复用：智能检索 SSE 流、知识库 RAG SSE 流（后端就绪后）均使用
//
// 用法：
//   const { read } = useSSEStream()
//   const res = await fetch('/search', { method: 'POST', body: ... })
//   await read(res, (data) => { /* 处理每条 JSON 数据 */ })
export const useSSEStream = () => {
  // 缓冲区用 ref 持有，跨多次 read 调用隔离；每次 read 开始时重置
  const bufferRef = useRef('')

  const read = async (response, onData) => {
    if (!response?.body) return

    const streamReader = response.body.getReader()
    const decoder = new TextDecoder()
    bufferRef.current = ''

    while (true) {
      const { done, value } = await streamReader.read()
      console.log("response>>",done,value)
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      bufferRef.current += chunk
      console.log("chunk>>",chunk)

      // 按 SSE 帧分隔符拆分，最后一段可能不完整，留作缓冲
      const events = bufferRef.current.split('\n\n')
      bufferRef.current = events.pop() || ''

      for (const item of events) {
        const match = item.match(/^data: (.*)$/m)
        console.log("match>>",item,match)
        if (!match) continue
        try {
          const data = JSON.parse(match[1])
          console.log("jsondata>>",item,match)
          onData(data)
        } catch {
          // 非 JSON 数据（如心跳、注释），跳过
        }
      }
    }
  }

  return { read }
}
