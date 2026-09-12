import React from 'react'
import './KnowledgeHeader.css'

// 职责：页面标题 + 概览统计 + 触发上传（控制 Modal 开合）
export const KnowledgeHeader = ({ stats, onUploadClick }) => {
  const statItems = [
    { label: '文档总数', value: stats.totalDocs },
    { label: '话题数', value: stats.totalTopics },
    { label: '本周新增', value: stats.weeklyNew }
  ]

  return (
    <div className="knowledge-header">
      <div className="knowledge-header-title">
        <h3>知识库</h3>
        <p>RAG 检索与知识沉淀</p>
      </div>

      <div className="knowledge-header-stats">
        {statItems.map((item) => (
          <div key={item.label} className="knowledge-stat-card">
            <div className="knowledge-stat-value">{item.value}</div>
            <div className="knowledge-stat-label">{item.label}</div>
          </div>
        ))} 
      </div>

      <button className="primary-btn knowledge-upload-btn" onClick={onUploadClick}>
        + 上传文档
      </button>
    </div>
  )
}
