import { KnowledgeComponents } from './components'
import { DocumentUploader } from '@components/index'
import { useRagConversation, useKnowledgeDocuments } from './hooks'
import { useDocumentUpload } from '@hooks/index'
import './KnowledgePage.css'

export const KnowledgePage = () => {
  // 知识库页面状态按职责拆分为三个 hook：
  // - useRagConversation：问答对话与流式回答
  // - useKnowledgeDocuments：文档列表与筛选
  // - useDocumentUpload：上传 Modal、进度、AI 提取（上传结果通过 onUploaded 回交列表）
  const { documentInfo, topics, stats, selectedTopic, fetchDataCallback, deleteDocument, filterByTopic } =
    useKnowledgeDocuments()
  const {
    isUploaderOpen,
    setIsUploaderOpen,
    uploadProgress,
    isUploading,
    extractDocumentMeta,
    uploadDocuments,
  } = useDocumentUpload({ onUploaded: (pageNum) => { setTimeout(() => { fetchDataCallback(pageNum) }, 3000) } })
  const { query, setQuery, conversations, streamingAnswer, isQuerying, executeRagQuery } =
    useRagConversation()


  return (
    <section className="knowledge-panel">
      <KnowledgeComponents.KnowledgeHeader
        stats={stats}
        onUploadClick={() => setIsUploaderOpen(true)}
      />

      <div className="knowledge-body">
        <KnowledgeComponents.TopicSidebar
          topics={topics}
          stats={stats}
          selectedTopic={selectedTopic}
          onTopicSelect={filterByTopic}
        />

        <div className="knowledge-main">
          <KnowledgeComponents.RagSearch
            query={query}
            setQuery={setQuery}
            onSearch={executeRagQuery}
            isQuerying={isQuerying}
          />

          <KnowledgeComponents.QaConversation
            conversations={conversations}
            streamingAnswer={streamingAnswer}
            isQuerying={isQuerying}
          />
        </div>
      </div>

      <KnowledgeComponents.DocumentList
        selectedTopic={selectedTopic}
        onDelete={deleteDocument}
        fetchDataCallback={fetchDataCallback}
        documentInfo={documentInfo}
      />

      <DocumentUploader
        isOpen={isUploaderOpen}
        mode="upload"
        uploadProgress={uploadProgress}
        isUploading={isUploading}
        onExtract={extractDocumentMeta}
        onUpload={uploadDocuments}
        onClose={() => setIsUploaderOpen(false)}
      />
    </section>
  )
}
