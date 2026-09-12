import { useState, useCallback, useEffect } from 'react'
import { useTypewriter, useSSEStream } from '@hooks/index'
import { ITERATION_LIMIT } from '@/consts/index'
import { newsApi } from '@api/index'

// 智能检索执行 hook（智能检索页面专属）
// 单一职责：管理检索输入、执行流程、状态/耗时、流式结果与摘要
// 复用通用 useTypewriter（逐字输出）与 useSSEStream（SSE 解析）
// 检查点通过回调交由 useCheckpoints 管理，保持解耦
//
// 用法：
//   const checkpoints = useCheckpoints()
//   const search = useSearchExecution({
//     onCheckpoint: checkpoints.updateCheckpoint,
//     onResetCheckpoints: checkpoints.resetCheckpoints
//   })
interface UseSearchExecutionProps {
  onCheckpoint?: (name: string, checkpointInfo: any) => void
  onResetCheckpoints?: () => void
  selectedCheckpoint?: { threadId?: string; checkpointId?: string }
}

export const useSearchExecution = ({ onCheckpoint, onResetCheckpoints, selectedCheckpoint }: UseSearchExecutionProps = {}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchStatus, setSearchStatus] = useState('就绪')
  const [iterationCount, setIterationCount] = useState(0)
  const [searchTime, setSearchTime] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const { threadId, checkpointId } = selectedCheckpoint || {}

  // 两路流式输出：检索过程结果 + 最终摘要
  const summary = useTypewriter('')
  const results = useTypewriter('')
  const { read: readSSE } = useSSEStream()

  // 重置检索状态（不含 query，query 由输入框保留）
  const resetSearch = useCallback(() => {
    setSearchStatus('就绪')
    setIterationCount(0)
    setSearchTime(0)
    setIsSearching(false)
    summary.reset()
    results.reset()
    onResetCheckpoints?.()
  }, [summary, results, onResetCheckpoints])

  // 构造状态更新闭包（捕获本次检索起始时间）
  const createSearchUpdate = () => {
    const startTime = Date.now()
    const update = (isInit, status, searching) => {
      if (!isInit) setSearchTime(Math.round((Date.now() - startTime) / 1000))
      setSearchStatus(status)
      setIsSearching(searching)
    }
    return update
  }

  useEffect(() => {
    const searchWhenSelectCheckpoint = async () => {
      // 当选中checkpoint变化时，如果该checkpoint有threadId，则自动执行重新检索

      if (threadId && checkpointId) {
        await executeSearch(true)
      }
    }
    searchWhenSelectCheckpoint()

  }, [threadId, checkpointId])

  // 执行检索
  const executeSearch = async (isBackSearch = false) => {
    if (isSearching) {
      newsApi.cancelSearch()
      setIsSearching(false)
      return
    }
    if (!searchQuery.trim()) return

    const updateSearch = createSearchUpdate()
    try {
      // 重置检索状态，标记检索中
      resetSearch()
      updateSearch(true, '检索中', true)
      // 发起 POST 请求，携带检索内容
      const res = await newsApi.search(searchQuery, threadId, checkpointId)

      updateSearch(false, '分析中...', true)

      // 读取 SSE 流，逐条分发到对应打字机
      await readSSE(res, (targetData) => {
        const message = targetData?.message || ''
        const count = targetData?.iteration_count
        const isFinal = targetData?.is_final
        const error = targetData?.error || ''

        // 达到迭代上限或最终结果 → 写入摘要；否则写入过程结果
        if (count >= ITERATION_LIMIT || isFinal) {
          summary.append(message)
          updateSearch(false, '已完成', false)
        } else if (error) {
          results.append(error)
          updateSearch(false, '检索失败，请稍后重试', false)
        } else {
          results.append(message)
        }
        setIterationCount(count)

        // 保存检查点（交由 useCheckpoints 管理）
        if (targetData?.checkpoint_info) {
          // 如果是重新检索，名称为"重新检索"；如果是初次检索，名称为"迭代1"、"迭代2"等
          const checkpointName = isBackSearch ? `重新检索` : `迭代${count}`
          onCheckpoint?.(checkpointName, targetData.checkpoint_info)
        }
      })


    } catch (error) {
      console.log(error)
      updateSearch(false, '检索失败，请稍后重试', false)
    }
  }
  return {
    // 状态
    searchQuery,
    searchStatus,
    iterationCount,
    searchTime,
    isSearching,
    searchResults: results.typingInfo.text,
    summaryResults: summary.typingInfo.text,
    isTyping:results.typingInfo.isTyping || summary.typingInfo.isTyping,
    // 动作
    setSearchQuery,
    resetSearch,
    executeSearch
  }
}
