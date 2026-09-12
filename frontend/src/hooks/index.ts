// 通用 hooks 统一导出（跨页面复用）
// 单一职责：每个 hook 只做一件事，页面专属逻辑放在 pages/<Page>/hooks 下
import { useTypewriter } from './useTypewriter'
import { useSSEStream } from './useSSEStream'
import { usePagination } from './usePagination'
import { useAuth } from './useAuth'
import { useDocumentUpload } from './useDocumentUpload'
import { useDebounce } from './useDebounce'

export const CommonHooks = {
  useTypewriter,
  useSSEStream,
  usePagination,
  useAuth,
  useDocumentUpload,
  useDebounce
}

// 具名导出，便于页面按需引入
export { useTypewriter, useSSEStream,useAuth,usePagination,useDocumentUpload, useDebounce }
