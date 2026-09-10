import React from 'react'
import './Pagination.css'

export const Pagination = ({ currentPage, totalPages, onPageChange, className = '' }) => {
  // 计算页码范围
  const getPageRange = () => {
    const delta = 2 // 当前页码左右显示的页数
    let range = []
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }
    
    // 添加第一页 
    if (currentPage > delta + 2) {
      range.unshift(1)
    }
    
    // 添加省略号和最后一页
    if (currentPage < totalPages - delta - 1) {
      if (range.length > 0 && range[range.length - 1] !== totalPages - 1) {
        range.push('...')
      }
      range.push(totalPages)
    }
    
    return range
  }

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  const pageNumbers = getPageRange()

  return (
    <div className={`pagination-container ${className}`}>
      {/* 上一页 */}
      <button
        className="pagination-btn"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="上一页"
      >
        上一页
      </button>

      {/* 页码 */}
      {pageNumbers.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="pagination-ellipsis">...</span>
          ) : (
            <button
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
              aria-label={`前往第 ${page} 页`}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      {/* 下一页 */}
      <button
        className="pagination-btn"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="下一页"
      >
        下一页
      </button>
    </div>
  )
}
