import './SearchStatus.css'

export const SearchStatus = ({ status, iterationCount, searchTime, isSearching }) => {
  return (
    <div className="search-status">
      <div className="status-item">
        <span className="status-label">状态:</span>
        <span className={`status-value ${isSearching ? 'searching' : ''}`}>
          {status}
        </span>
      </div>
      <div className="status-item">
        <span className="status-label">迭代次数:</span>
        <span className="status-value">{iterationCount}/5</span>
      </div>
      <div className="status-item">
        <span className="status-label">耗时:</span>
        <span className="status-value">{searchTime}秒</span>
      </div>
      <div className="status-item">
        <span className="status-label">结果数量:</span>
        <span className="status-value">0</span>
      </div>
    </div>
  )
}