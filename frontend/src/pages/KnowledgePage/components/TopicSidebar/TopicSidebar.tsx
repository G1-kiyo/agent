import React from 'react'
import './TopicSidebar.css'

// 职责：话题标签云 + 统计卡片，提供按话题筛选能力
export const TopicSidebar = ({ topics, stats, selectedTopic, onTopicSelect }) => {
  return (
    <aside className="topic-sidebar">
      <div className="topic-sidebar-section">
        <h4 className="topic-sidebar-title">热门话题</h4>
        <div className="topic-cloud">
          <span
            className={`tag ${selectedTopic === null ? 'active' : ''}`}
            onClick={() => onTopicSelect(null)}
          >
            全部
          </span> 
          {topics.map((topic) => (
            <span
              key={topic.tag_id}
              className={`tag ${selectedTopic === topic.tag_name ? 'active' : ''}`}
              onClick={() => onTopicSelect(topic.tag_name)}
            >
              {topic.tag_name}
              <span className="tag-count">{topic.count}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="topic-sidebar-section">
        <h4 className="topic-sidebar-title">统计概览</h4>
        <div className="topic-stats">
          <div className="topic-stat-row">
            <span>文档总数</span>
            <strong>{stats.totalDocs}</strong>
          </div>
          <div className="topic-stat-row">
            <span>话题数</span>
            <strong>{stats.totalTopics}</strong>
          </div>
          <div className="topic-stat-row">
            <span>本周新增</span>
            <strong>{stats.weeklyNew}</strong>
          </div>
        </div>
      </div>
    </aside>
  )
}
