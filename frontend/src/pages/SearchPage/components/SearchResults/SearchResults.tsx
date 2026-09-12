import './SearchResults.css'

export const SearchResults = ({ results, onPublish, onSave }) => {
  const mockResults = [
    {
      title: 'OpenAI发布新一代GPT-5模型，性能大幅提升',
      summary: 'OpenAI发布了GPT-5模型，在推理能力、多模态支持和代码生成方面都有显著改进。该模型能够处理更复杂的任务，支持长上下文对话，并具备更好的多语言理解能力。',
      source: 'TechCrunch',
      time: '2026-07-28 10:30',
      tags: ['OpenAI', 'GPT', '大模型']
    },
    {
      title: 'Anthropic获得40亿美元D轮融资，估值达400亿',
      summary: 'AI公司Anthropic成功完成40亿美元D轮融资，由Google领投。公司表示资金将用于研发更安全的AI系统和扩大业务规模。',
      source: 'VentureBeat',
      time: '2026-07-28 09:15',
      tags: ['Anthropic', '融资', '安全']
    },
    {
      title: 'Meta发布开源大模型Llama 3.1，支持商业用途',
      summary: 'Meta发布了Llama 3.1大模型，这次更新在性能上有显著提升，并且明确支持商业用途。模型包含400B参数版本，在多项基准测试中表现优异。',
      source: 'The Verge',
      time: '2026-07-28 08:45',
      tags: ['Meta', '开源', 'Llama']
    }
  ]

  const displayResults = results.length > 0 ? results : mockResults

  return (
    <div className="search-results">
      <h4>检索结果</h4>
      <div className="results-list">
        {displayResults.map((result, index) => (
          <div key={index} className="result-item">
            <h5>{result.title}</h5>
            <p>{result.summary}</p>
            <div className="result-meta">
              <span className="result-source">{result.source}</span>
              <span className="result-time">{result.time}</span>
            </div>
            <div className="result-tags">
              {result.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="result-tag">{tag}</span>
              ))}
            </div>
            <div className="result-actions">
              <button 
                className="secondary-btn"
                onClick={() => onPublish(result)}
              >
                发布到群组
              </button>
              <button 
                className="secondary-btn"
                onClick={() => onSave(result)}
              >
                保存到知识库
              </button>
            </div>
          </div>
        ))}
        {displayResults.length === 0 && (
          <div className="result-item">
            <h5>暂无结果</h5>
            <p>请输入查询并开始检索</p>
          </div>
        )}
      </div>
    </div>
  )
}