import React, { useState, useMemo, useEffect } from 'react'
import { discussionApi } from '../../../../api/discussion'
import { Pagination } from '../../../../components'
import { DiscussionCategory, DiscussionSort } from "../../const"
import './HistoricalTopics.css'

/**
 * 历史话题列表组件
 * 展示历史话题，支持搜索、筛选和快速切换
 */
export const HistoricalTopics = ({
  topics: historicalTopics,
  topicListStats,
  filterCondition,
  updateFilterCondition,
  resetFilterCondition,
  onSelectTopic,
  onCreateTopic,
}) => {
  const [expandedTopicId, setExpandedTopicId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  // 当前选中话题
  const [selectedTopic, setSelectedTopic] = useState(null)

  // 话题创建表单
  const [discussionInfo, setDiscussionInfo] = useState({
    title: "",
    category: DiscussionCategory.TECHNOLOGY,
    desc: ""
  })
  // 话题种类列表
  const [discussionCategories, setDiscussionCategories] = useState([])


  useEffect(() => {
    getCategories()
  }, [])
  // 重置表单
  const resetFields = () => {
    setDiscussionInfo({
      title: "",
      category: DiscussionCategory.TECHNOLOGY,
      desc: ""
    })
  }

  // 请求话题种类列表
  const getCategories = async () => {
    const categories = await discussionApi.categories()
    setDiscussionCategories(categories)
  }
  // 表单项变更回调
  const handleDiscussionInfoChange = (key, val) => {
    setDiscussionInfo((prev) => ({
      ...prev,
      [key]: val
    }))
  }


  // 处理话题选择
  const handleSelectTopic = (topic) => {
    setExpandedTopicId(expandedTopicId === topic.id ? null : topic.id)
  }

  // 处理创建新话题
  const handleCreateTopic = () => {
    setIsCreating(true)
  }

  // 取消创建
  const handleCancelCreate = () => {
    setIsCreating(false)
  }


  // 时间格式化
  const formatTimeAgo = (timestamp) => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
    if (diff < 31536000000) return `${Math.floor(diff / 2592000000)}个月前`
    return `${Math.floor(diff / 31536000000)}年前`
  }
  const { total, filtered, pageNum, pageSize } = topicListStats

  return (
    <div className="historical-topics">
      {/* 头部 */}
      <div className="topics-header">
        <div className="header-main">
          <h2 className="topics-title">历史话题</h2>
          <div className="topics-stats">
            <span className="stat-item">共 {total} 个话题</span>
            {filtered !== total && (
              <span className="stat-item">显示 {filtered} 个</span>
            )}
          </div>
        </div>

        <button
          className="create-topic-btn"
          onClick={handleCreateTopic}
        >
          <span className="plus-icon">+</span>
          新建话题
        </button>
      </div>

      {/* 创建话题表单 */}
      {isCreating && (
        <div className="create-topic-form">
          <div className="form-header">
            <h3>创建新话题</h3>
            <button
              className="close-btn"
              onClick={handleCancelCreate}
            >
              ×
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="topic-title">话题标题</label>
            <input
              type="text"
              id="topic-title"
              placeholder="输入话题标题..."
              className="form-input"
              autoFocus
              onChange={(e) => handleDiscussionInfoChange("title", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="topic-category">话题分类</label>
            <select
              id="topic-category"
              className="form-select"
              onChange={(e) => handleDiscussionInfoChange("category", Number(e.target.value))}
            >
              {discussionCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="topic-description">话题描述</label>
            <textarea
              id="topic-description"
              placeholder="描述这个话题的主要内容..."
              className="form-textarea"
              rows={3}
              onChange={(e) => handleDiscussionInfoChange("desc", e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button
              className="cancel-btn"
              onClick={handleCancelCreate}
            >
              取消
            </button>
            <button
              className="submit-btn"
              onClick={async () => {
                await onCreateTopic(discussionInfo)
                resetFields()
                setIsCreating(false)
              }}
            >
              创建话题
            </button>
          </div>
        </div>
      )}

      {/* 搜索和筛选 */}
      <div className="topics-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索话题..."
            className="search-input"
            value={filterCondition.searchTerm}
            onChange={(e) => updateFilterCondition('searchTerm', e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <select
            className="filter-select"
            value={filterCondition.filterCategory}
            onChange={(e) => updateFilterCondition('filterCategory', Number(e.target.value))}
          >
            {[{ id: 0, name: "全部分类" }, ...discussionCategories].map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            className="sort-select"
            value={filterCondition.sortBy}
            onChange={(e) => {console.log("change",e,e.target.value);updateFilterCondition('sortBy', Number(e.target.value))}}
          >
            <option value={DiscussionSort.LAST_ACTIVITY}>最后活跃</option>
            <option value={DiscussionSort.MESSAGE_NUM}>消息数量</option>
            <option value={DiscussionSort.CREATE_AT}>创建时间</option>
          </select>
        </div>
      </div>

      {/* 话题列表 */}
      <div className="topics-list">
        {historicalTopics.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <p>没有找到匹配的话题</p>
            <button
              className="clear-filters"
              onClick={() => {
                resetFilterCondition()
              }}
            >
              清除筛选
            </button>
          </div>
        ) : (
          historicalTopics.map(topic => (
            <div
              key={topic.id}
              className={`topic-item ${topic.is_active ? 'active' : ''} ${expandedTopicId === topic.id ? 'expanded' : ''}`}
              onClick={() => handleSelectTopic(topic)}
            >
              {/* 话题头部 */}
              <div className="topic-header">
                <div className="topic-main">
                  <h3 className="topic-title">{topic.title}</h3>
                  <span className={`topic-status ${topic.is_active ? 'active' : 'inactive'}`}>
                    {topic.is_active ? '活跃' : '已归档'}
                  </span>
                </div>

                <div className="topic-meta">
                  <span className="category-tag">{topic.category || '未分类'}</span>
                  <span className="time-ago">{formatTimeAgo(topic.last_activity)}</span>
                </div>
              </div>

              {/* 话题详情 */}
              {expandedTopicId === topic.id && (
                <div className="topic-details">

                  {topic.description && (
                    <div className="topic-description">
                      <p>{topic.description}</p>
                    </div>
                  )}

                  {topic.tags && topic.tags.length > 0 && (
                    <div className="topic-tags">
                      {topic.tags.map(tag => (
                        <span key={tag} className="topic-tag">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="topic-actions">
                    <button
                      className="action-btn primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onSelectTopic) {
                          onSelectTopic(topic)
                        }
                      }}
                    >
                      查看详情
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        // 复制链接
                        const url = `${window.location.origin}/topics/${topic.id}`
                        navigator.clipboard.writeText(url)
                      }}
                    >
                      复制链接
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Pagination
        currentPage={pageNum}
        totalPages={Math.ceil(total / pageSize)}
        onPageChange={(page) => getHistoricalTopics({
          filterCategory, sortBy, searchTerm, pageSize, pageNum: page
        })}
      >

      </Pagination>

      {/* 底部信息 */}
      {historicalTopics.length > 0 && (
        <div className="topics-footer">
          <div className="footer-info">
            显示 {historicalTopics.length} / {total} 个话题
          </div>
          <div className="footer-actions">
            <button
              className="refresh-btn"
              onClick={() => {
                resetFilterCondition()
              }}
            >
              重置筛选
            </button>
          </div>
        </div>
      )}
    </div>
  )
}