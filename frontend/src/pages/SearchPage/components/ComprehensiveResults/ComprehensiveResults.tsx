import React, { useEffect, useRef, useState } from 'react'
// import remarkGfm from 'remark-gfm'
// import rehypeHighlight from 'rehype-highlight'
import { ITERATION_LIMIT } from '@consts/index'
import { MarkdownResults } from '@components/index';
import './ComprehensiveResults.css'

// 代码高亮主题CSS
import 'highlight.js/styles/github.css'

export const ComprehensiveResults = ({
  searchResults,
  summaryReport,
  isSearching,
  iterationCount = 0
}) => {
  const scrollContainerRef = useRef(null)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // 检查是否需要自动折叠
  useEffect(() => {
    if (iterationCount >= ITERATION_LIMIT && !isSearching) {
      setIsCollapsed(true)
    } else {
      setIsCollapsed(false)
    }
  }, [iterationCount, isSearching])

  // 自动滚动到底部
  useEffect(() => {
    if (scrollContainerRef.current && isSearching && !hasScrolled && !isCollapsed) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [searchResults, isSearching, hasScrolled, isCollapsed])

  // 监听到有汇总信息了，收起检索数据
  useEffect(() => {
    if (summaryReport?.length > 0) {
      setIsCollapsed(true);
    }
  }, [summaryReport])

  // 处理滚动事件
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50
      setHasScrolled(!isAtBottom)
    }
  }

  // 处理折叠/展开点击
  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }


  return (
    <div className="comprehensive-results">
      {/* 检索结果模块 */}
      <div className="search-results-section">
        <div className="section-header">
          <h3>检索结果</h3>
          {isSearching && (
            <span className="searching-indicator">
              <span className="pulse-dot"></span>
              检索中...
            </span>
          )}
        </div>

        {/* 检索到的具体数据模块 - 固定高度，可滚动，支持折叠 */}
        {searchResults.length > 0 &&
          (
            <div
              className={`search-data-module ${isCollapsed ? 'collapsed' : 'expanded'}`}
            >

              <div
                className="search-data-header"
                onClick={handleToggleCollapse}
              >
                <span>📋 检索数据</span>
                <span className="collapse-arrow">▼</span>
              </div>
              <div
                className="search-data-content"
                ref={scrollContainerRef}
                onScroll={handleScroll}
                onClick={(e) => e.stopPropagation()} // 防止点击内容区域时触发折叠
              >
                <MarkdownResults content={searchResults}></MarkdownResults>
              </div>
              {hasScrolled && !isCollapsed && (
                <div className="scroll-hint">
                  <span className="scroll-hint-text">↑ 滚动查看更多结果 ↑</span>
                </div>
              )}
            </div>
          )
        }


        {/* 汇总报告 - 直接在检索结果模块内 */}
        <div className="summary-report-module">
          <div className="summary-report-content">
            <MarkdownResults content={summaryReport}></MarkdownResults>
          </div>
        </div>
      </div>
    </div>
  )
}