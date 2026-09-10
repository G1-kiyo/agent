// 搜索相关组件统一导出（页面专属组件）
import { SearchForm } from './SearchForm/SearchForm'
import { SearchResults } from './SearchResults/SearchResults'
import { MarkdownResults } from '../../../components/MarkdownResults/MarkdownResults'
import { ComprehensiveResults } from './ComprehensiveResults/ComprehensiveResults'
import { SearchProgress } from './SearchProgress/SearchProgress'
import { SearchStatus } from './SearchStatus/SearchStatus'
import { Checkpoints } from './Checkpoints/Checkpoints'
import { AgentStatus } from './AgentStatus/AgentStatus'

// 导出组件组以便于统一导入
export const SearchComponents = {
  SearchForm,
  SearchResults,
  MarkdownResults,
  ComprehensiveResults,
  SearchProgress,
  SearchStatus,
  Checkpoints,
  AgentStatus
}
