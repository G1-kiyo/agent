import { useState, useRef, useCallback, useEffect } from 'react'
import TypeWritter from '../utils/typewritter'

// 通用打字机流式输出 hook
// 单一职责：管理一段流式文本的逐字输出（封装 TypeWritter 实例 + 文本状态）
// 跨页面复用：知识库 RAG 回答、智能检索结果/摘要 均使用
export const useTypewriter = (options) => {
  const [typingInfo, setTypingInfo] = useState({
    text: "",
    isTyping: false
  })
  const typewriterRef = useRef(null)
  // 用 ref 持有 options，避免每次渲染重建实例；options 一般为常量
  const optionsRef = useRef(options)
  optionsRef.current = options
  // 确保实例已创建（惰性创建，首次 append 时初始化）
  const ensureInstance = useCallback(() => {
    if (!typewriterRef.current) {
      typewriterRef.current = new TypeWritter(optionsRef.current)
    }
    return typewriterRef.current
  }, [])

  // 追加一段文本到输出缓冲
  const append = useCallback((chunk) => {
    const tw = ensureInstance()
    tw.append(chunk)
  }, [ensureInstance])

  // 停止打字（保留已输出文本）
  const stop = useCallback(() => {
    typewriterRef.current?.stop?.()
  }, [])

  // 重置：停止打字并清空已输出文本
  const reset = useCallback(() => {
    stop()
    setTypingInfo({
      text: "",
      isTyping: false
    })
  }, [stop])

  useEffect(()=>{
    const unsubscribe = typewriterRef.current?.subscribe(setTypingInfo)
    return unsubscribe;
  },[typewriterRef.current])

  return { typingInfo, append, stop, reset, }
}
