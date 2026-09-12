import { mockRagSuggestions } from '../DocumentList/data/mockData'
import './RagSearch.css'

// 职责：RAG 检索输入 + 推荐问题
export const RagSearch = ({ query, setQuery, onSearch, isQuerying }) => {
  const handleSearch = () => {
    if (query.trim()) onSearch()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion)
  }

  return (
    <div className="rag-search-container">
      <div className="rag-search-form">
        <input
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="基于知识库提问，例如：上次团队讨论 DeepSeek 的结论是什么？"
          className="rag-search-input"
          disabled={isQuerying}
        />
        <button className="primary-btn" onClick={handleSearch}>
          {isQuerying ? '取消检索' : '检索'}
        </button>
      </div>

      <div className="rag-suggestions">
        <span className="rag-suggestions-label">推荐问题：</span>
        {mockRagSuggestions.map((suggestion, index) => (
          <span
            key={index}
            className="rag-suggestion"
            onClick={() => !isQuerying && handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </span>
        ))}
      </div>
    </div>
  )
}
