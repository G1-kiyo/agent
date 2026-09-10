// 知识库页面专属 hooks 统一导出
// 各 hook 遵循单一职责，由 KnowledgePage 组合使用
import { useRagConversation } from './useRagConversation'
import { useKnowledgeDocuments } from './useKnowledgeDocuments'

export const KnowledgeHooks = {
  useRagConversation,
  useKnowledgeDocuments,
}

// 具名导出，便于页面按需引入
export { useRagConversation, useKnowledgeDocuments }
