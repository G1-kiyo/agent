// 智能检索页面专属 hooks 统一导出
// 各 hook 遵循单一职责，由 SearchPage 组合使用
import { useSearchExecution } from './useSearchExecution'
import { useCheckpoints } from './useCheckpoints'

export const SearchHooks = {
  useSearchExecution,
  useCheckpoints
}

// 具名导出，便于页面按需引入
export { useSearchExecution, useCheckpoints }
