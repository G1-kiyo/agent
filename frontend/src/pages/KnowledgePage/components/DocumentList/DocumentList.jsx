import React, { useCallback, useEffect, useState } from 'react'
import { usePagination } from '../../../../hooks'
import { knowledgeApi } from '../../../../api'
import './DocumentList.css'
import { Pagination } from '../../../../components'

// 职责：文档列表（核心持久化实体展示 + 筛选/排序/删除）
export const DocumentList = ({ selectedTopic, onDelete, fetchDataCallback, documentInfo }) => {
  const { totalCount,totalPages, documents=[]} = documentInfo

    // 使用分页hook
  const { currentPage, isLoading, fetchCurrentPage } = usePagination({
    fetchDataCallback,
    totalPages
  })


  // 切换话题时重新加载数据
  useEffect(() => {
    fetchCurrentPage(1)
  }, [selectedTopic, fetchCurrentPage])

  // 处理分页
  const handlePageChange = useCallback((page) => {
    fetchCurrentPage(page)
  }, [fetchCurrentPage])

  // 处理删除
  const handleDelete = async (id) => {
    try {
      await onDelete(id)
      // 删除后刷新当前页数据
      fetchCurrentPage(currentPage)
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }

  return (
    <div className="document-list-container">
      <div className="document-list-header">
        <h4>
          {selectedTopic ? `话题「${selectedTopic}」的文档` : '最近入库'}
          <span className="document-list-count">({totalCount})</span>
        </h4>
      </div>

      {isLoading ? (
        <div className="document-list-loading">
          <div className="loading-spinner">加载中...</div>
        </div>
      ) : documents.length === 0 ? (
        <div className="document-list-empty">
          <div className="document-empty-icon">📄</div>
          <p>暂无文档</p>
          <p className="document-empty-hint">请上传文档或从检索结果保存</p>
        </div>
      ) : (
        <div className="document-list">
          {documents.map((doc) => (
            <div key={doc.id} className="document-item">
              <div className="document-item-main">
                <div className="document-item-title-row">
                  <h5 className="document-item-title">{doc.title}</h5>
                  <span className="document-item-source">{doc.source}</span>
                </div>
                <p className="document-item-summary">{doc.summary}</p>
                <div className="document-item-meta">
                  <span className="document-item-time">{doc.createdAt}</span>
                  <div className="document-item-tags">
                    {doc.tags.map((tag) => (
                      <span key={tag.tag_id} className="document-tag">{tag.tag_name}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="document-item-actions">
                {doc.sourceUrl && (
                  <a
                    href={doc.sourceUrl}
                    className="document-action-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    源链接
                  </a>
                )}
                <button
                  className="document-action-btn danger"
                  onClick={() => handleDelete(doc.id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* 分页器 */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          className="document-pagination"
        />
      )}
    </div>
  )
}
