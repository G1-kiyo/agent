import './SearchForm.css'

const searchExamples = [
  '最近一周AI领域有什么融资新闻？',
  '大模型领域的最新技术进展',
  '科技公司发布了哪些重要产品？',
  'AI在医疗领域的应用现状',
  '投资机构对AI行业的看法'
]

export const SearchForm = ({ searchQuery, setSearchQuery, onSearch, isSearching }) => {

  const handleSearch = () => {
    onSearch(searchQuery)
  }

  const handleExampleClick = (example) => {
    setSearchQuery(example)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="search-form-container">
      <div className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="例如：最近一周AI领域有什么融资新闻？"
          className="search-input"
          disabled={isSearching}
        />
        <button
          className="primary-btn"
          onClick={handleSearch}
        >
          {isSearching ? '取消检索' : '开始检索'}
        </button>
      </div>

      <div className="search-examples">
        <span className="examples-label">搜索示例：</span>
        {searchExamples.map((example, index) => (
          <span
            key={index}
            className="search-example"
            onClick={() => handleExampleClick(example)}
          >
            {example}
          </span>
        ))}
      </div>
    </div>
  )
}