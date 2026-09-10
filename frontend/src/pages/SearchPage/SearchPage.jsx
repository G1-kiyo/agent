import { useState } from 'react'
import { SearchComponents } from './components'
import { DocumentUploader } from '../../components'
import { useSearchExecution, useCheckpoints } from './hooks'
import { useDocumentUpload } from '../../hooks'
import { mockSearchResults, mockSummaryReport } from './components/ComprehensiveResults/data/mockData'
import './SearchPage.css'
import { discussionApi } from '../../api/discussion'
import { ForkType } from '../DiscussionPage/const'

export const SearchPage = () => {
  // 检索状态按职责拆分为两个 hook：
  // - useCheckpoints：检查点列表与选中态
  // - useSearchExecution：检索输入、执行流程、流式结果（通过回调联动检查点）
  const {
    checkpoints,
    selectedCheckpoint,
    latestCheckpoint,
    updateCheckpoint,
    selectCheckpoint,
    createFork,
    resetCheckpoints
  } = useCheckpoints()
  const {
    searchQuery,
    searchStatus,
    iterationCount,
    searchTime,
    isSearching,
    searchResults,
    summaryResults,
    isTyping,
    setSearchQuery,
    resetSearch,
    executeSearch,
  } = useSearchExecution({
    onCheckpoint: updateCheckpoint,
    onResetCheckpoints: resetCheckpoints,
    selectedCheckpoint
  })

  const { isUploaderOpen, setIsUploaderOpen, uploadProgress, isUploading, extractDocumentMeta, uploadDocuments } =
    useDocumentUpload()

  // 保存到知识库 Modal 状态
  const [saveToast, setSaveToast] = useState('')
  const [savedFiles, setSavedFiles] = useState([])

  const handleSearch = async () => {
    console.log(searchQuery)
    await executeSearch()
  }

  const handlePublishToGroup = (result) => {
    alert(`已发布到群组: ${result.title}`)
  }

  const handleOpenSaveModal = () => {
    const text = `${searchResults}\n\n${summaryResults}`
    const savedFile = new File([text], "search_results.txt", {
      "type": "text/plain",
      "lastModified": new Date().getTime()
    })
    setSavedFiles([savedFile])
    setIsUploaderOpen(true)
  }



  const handleCreateFork = async () => {
    try {
      await discussionApi.fork({ type: ForkType.NON_DISCUSSION, content: summaryResults })
      setTimeout(() => {
        window.location.href = "discussion.html"
      },2000)

    } catch (err) {
      console.log("Failed to create fork: ", err)
    }
  }

  // 是否有可保存的检索结果
  const hasResults = !isTyping && (summaryResults?.length > 0 || searchResults?.length > 0)
  console.log("result", hasResults, summaryResults, searchResults)
  return (
    <section className="search-panel">
      <div className="search-header">
        <h3>AI智能检索</h3>
        <p>输入问题，AI将自动进行多轮检索和推理，最多支持5轮迭代</p>
      </div>

      <SearchComponents.SearchForm
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        isSearching={isSearching}
      />

      {/* 搜索进度条 */}
      <SearchComponents.SearchProgress
        iterationCount={iterationCount}
        isSearching={isSearching}
      />

      {/* 搜索状态 */}
      <SearchComponents.SearchStatus
        status={searchStatus}
        iterationCount={iterationCount}
        searchTime={searchTime}
        isSearching={isSearching}
      />

      {/* 检索结果 */}
      <SearchComponents.ComprehensiveResults
        searchResults={searchResults}
        summaryReport={summaryResults}
        isSearching={isSearching}
        iterationCount={iterationCount}
      />

      {/* 保存到知识库入口 */}
      {hasResults && !isSearching && (
        <div className="search-save-bar">
          <button className="primary-btn" onClick={handleOpenSaveModal}>
            保存到知识库
          </button>
        </div>
      )}

      {/* 保存成功 Toast */}
      {saveToast && (
        <div className="search-save-toast">{saveToast}</div>
      )}

      {/* 检查点 */}
      <SearchComponents.Checkpoints
        checkpoints={checkpoints}
        selectedCheckpoint={selectedCheckpoint}
        latestCheckpoint={latestCheckpoint}
        onCheckpointSelect={selectCheckpoint}
        onCreateFork={handleCreateFork}
        canCreateFork={hasResults && !isSearching}
      />

      {/* Agent状态显示 */}
      <SearchComponents.AgentStatus
        iterationCount={iterationCount}
        isSearching={isSearching}
      />

      {/* 保存到知识库 Modal */}
      <DocumentUploader
        isOpen={isUploaderOpen}
        mode="save"
        savedFiles={savedFiles}
        uploadProgress={uploadProgress}
        isUploading={isUploading}
        onExtract={extractDocumentMeta}
        onUpload={uploadDocuments}
        onClose={() => setIsUploaderOpen(false)}
      />
    </section>
  )
}