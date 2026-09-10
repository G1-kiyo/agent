import React, { useState, useEffect } from 'react'
import { discussionApi } from '../../../../api/discussion'
import { MarkdownResults } from '../../../../components'
import './AIDebateGenerator.css'

/**
 * AI辩论生成器组件 - 优化版本
 * 独立于消息容器，放在header下方，具有独特的卡片式设计
 */
export const AIDebateGenerator = ({
  onGenerate,
  topicId = null
}) => {
  const [showGenerator, setShowGenerator] = useState(true)
  const [debateStyle, setDebateStyle] = useState('balanced')
  const [generatedDebate, setGeneratedDebate] = useState(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasError, setHasError] = useState(false)

  // 主题模板
  const topicTemplates = [
    '人工智能在企业中的应用',
    '远程办公的优缺点',
    '社交媒体对青少年的影响',
    '自动化技术对就业的影响',
    '区块链技术的未来前景'
  ]

  // 辩论风格选项
  const debateStyles = [
    { id: 'balanced', name: '均衡辩论', description: '正反双方观点平衡展示' },
    { id: 'critical', name: '深度批判', description: '深入分析各方观点的优缺点' },
    { id: 'practical', name: '实用主义', description: '从实际应用角度分析问题' },
    { id: 'theoretical', name: '理论探讨', description: '从理论和原理层面深入讨论' }
  ]

  // 辩论角色
  const debateRoles = [
    { id: 'supporter', name: '支持方', color: '#10b981' },
    { id: 'opposer', name: '反对方', color: '#ef4444' }
  ]

  // 处理生成辩论
  const handleGenerate = async () => {
    setHasError(false)
    setIsGenerating(true)
    setGeneratedDebate(null)

    try {
      const debateContent = await discussionApi.ai_debate(topicId)
      setGeneratedDebate(debateContent)
      onGenerate?.(debateContent)
    } catch (error) {
      console.error('AI辩论生成失败:', error)
      setHasError(true)
    } finally {
      setIsGenerating(false)
    }
  }

  // 生成辩论内容的模拟函数
  const generateDebateContent = async (topic, style) => {
    return {
      id: `debate-${Date.now()}`,
      topic: topic,
      style: style,
      messages: [
        {
          id: 'msg-1',
          role: 'supporter',
          content: `我认为${topic}非常有价值。从积极的角度看，这能够显著提升效率和创造新的可能性。`,
          timestamp: new Date().toISOString(),
          author: 'AI支持专家',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=supporter-${Date.now()}`
        },
        {
          id: 'msg-2',
          role: 'opposer',
          content: `但是我们需要谨慎对待这个问题。${topic}也存在一些潜在的风险和挑战，我们应该全面考虑。`,
          timestamp: new Date().toISOString(),
          author: 'AI反对专家',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=opposer-${Date.now()}`
        },
        {
          id: 'msg-3',
          role: 'supporter',
          content: `确实需要谨慎，但我认为关键在于如何正确地实施和管理。通过合理的规划和监督，风险是可以控制的。`,
          timestamp: new Date().toISOString(),
          author: 'AI支持专家',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=supporter-${Date.now()}`
        },
        {
          id: 'msg-4',
          role: 'opposer',
          content: `不过我们也不能忽视可能带来的负面影响。我们需要确保在追求进步的同时不损害核心价值和利益。`,
          timestamp: new Date().toISOString(),
          author: 'AI反对专家',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=opposer-${Date.now()}`
        }
      ],
      summary: `这是一个关于"${topic}"的深入讨论，双方从不同角度提出了有价值的观点。`
    }
  }

  // 导出辩论记录
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const exportData = {
        debate: generatedDebate,
        exportedAt: new Date().toISOString()
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement('a')
      link.href = url
      link.download = `辩论记录-${generatedDebate.topic}-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      alert('辩论记录已成功导出！')
    } catch (error) {
      console.error('导出失败:', error)
      alert('导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  // 重新生成
  const handleRegenerate = () => {
    setGeneratedDebate(null)
    handleGenerate()
  }



  // 展开时的处理逻辑 
  useEffect(() => {
    console.log("generate", showGenerator, generatedDebate, isGenerating)
    if (showGenerator && !isGenerating && topicId && !hasError && !generatedDebate) {
      // handleGenerate()
    }
  }, [showGenerator, generatedDebate, isGenerating, topicId])


  // 关闭组件 - 改为折叠状态而不是隐藏
  const handleClose = () => {
    setShowGenerator(false)
  }

  // 生成进度指示器组件
  const GeneratingProgress = () => (
    <div className="generating-progress">
      <div className="progress-steps">
        <div className="progress-step active">
          <span className="step-number">1</span>
          <span className="step-text">分析主题</span>
        </div>
        <div className="progress-line"></div>
        <div className="progress-step active">
          <span className="step-number">2</span>
          <span className="step-text">构建观点</span>
        </div>
        <div className="progress-line"></div>
        <div className="progress-step">
          <span className="step-number">3</span>
          <span className="step-text">完善论述</span>
        </div>
      </div>
      <div className="progress-animation">
        <div className="pulse-dot"></div>
        <div className="pulse-wave"></div>
      </div>
    </div>
  )

  // 移除了触发按钮，默认直接显示

  return (
    <div
      className={`ai-debate-generator ${!showGenerator ? 'collapsed' : ''} ${isGenerating ? 'generating' : ''}`}
      onClick={() => setShowGenerator(!showGenerator)}
    >
      {/* 折叠的标题栏 - 当整个组件被点击时切换展开状态 */}
      {!showGenerator && (
        <div className="collapsed-header-content">
          <div className="collapsed-title">
            <span className="ai-icon">🤖</span>
            <span className="debate-topic-truncated">{selectedTopic || 'AI辩论生成器'}</span>
          </div>
          <div className="status-indicator">
            {isGenerating ? (
              <span className="status-indicator generating"></span>
            ) : generatedDebate ? (
              <span className="status-indicator completed"></span>
            ) : (
              <span className="status-indicator ready"></span>
            )}
          </div>
        </div>
      )}

      {/* 展开的生成器 */}
      {showGenerator && (
        <div className="debate-expanded" onClick={(e) => e.stopPropagation()}>
          <div className="debate-header">
            <div className="header-main">
              <div className="debate-header-top">
                <h2 className="debate-title">
                  <span className={`ai-icon ${isGenerating ? 'generating' : ''}`}>🤖</span>
                  AI辩论生成器
                </h2>
                <button
                  className="collapse-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClose()
                  }}
                >
                  ↑
                </button>
              </div>
              <div className="debate-content-row">
                <div className="debate-status">
                  {isGenerating ? (
                    <span className="status generating">
                      <span className="loading-spinner"></span>
                      生成中...
                      <span className="generating-text">正在分析主题并构建辩论观点...</span>
                    </span>
                  ) : generatedDebate ? (
                    <span className="status completed">
                      <span className="checkmark">✓</span>
                      生成完成
                    </span>
                  ) : (
                    <span className="status ready">准备就绪</span>
                  )}
                </div>
                <div className="debate-actions">
                  {/* <select
                    className="debate-style-select"
                    value={debateStyle}
                    onChange={(e) => setDebateStyle(e.target.value)}
                    disabled={isGenerating || generatedDebate}
                  >
                    {debateStyles.map(style => (
                      <option key={style.id} value={style.id}>
                        {style.name}
                      </option>
                    ))}
                  </select> */}
                  <button
                    className="regenerate-btn"
                    onClick={handleRegenerate}
                    disabled={isGenerating}
                  >

                    重新生成
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 生成结果 - 只在展开状态下显示 */}
      {showGenerator && generatedDebate && (
        <div className="debate-result">
          {/* <div className="result-header">
            <h3 className="result-title">辩论结果</h3>
            <div className="result-actions">
              <button
                className="btn-secondary btn-small"
                onClick={handleRegenerate}
              >
                重新生成
              </button>
              <button
                className="btn-primary btn-small"
                onClick={() => {
                  const debateText = generatedDebate.messages
                    .map(msg => `[${msg.author}] ${msg.content}`)
                    .join('\n\n')
                  navigator.clipboard.writeText(debateText)
                  alert('辩论内容已复制到剪贴板')
                }}
              >
                复制内容
              </button>
              <button
                className="btn-secondary btn-small"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? '导出中...' : '导出记录'}
              </button>
            </div>
          </div> */}

          {/* 生成进度指示器 */}
          {isGenerating && <GeneratingProgress />}

          {/* 辩论摘要 */}
          {generatedDebate?.summary && (
            <div className="ai-debate-summary">
              <div className="summary-header">
                <h3 className="summary-title">📝 辩论摘要</h3>
              </div>
              <div className="summary-content">
                <p className="summary-text">
                  <MarkdownResults content={generatedDebate.summary}></MarkdownResults>
                </p>
              </div>
            </div>
          )}

          {/* 辩论内容 */}
          <div className="ai-debate-messages">
            {(generatedDebate?.opinions || []).map((message, index) => (
              <div key={index} className={`ai-message`}>
                <div className="ai-message-header">
                  <img
                    src={message.avatar}
                    alt={message.author}
                    className="ai-avatar"
                  />
                  <div className="ai-author-info">
                    <span className="ai-author-name">
                      {message.author}
                      {/* <span className={`ai-role-badge`}>
                        {message.role === 'supporter' ? '支持方' : '反对方'}
                      </span> */}
                    </span>
                    <span className="ai-message-time">
                      {new Date(message.create_at).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="ai-message-content">
                  <MarkdownResults content={message.content}></MarkdownResults>
                </div>

                <div className="ai-message-footer">
                  <span className="ai-style-tag">风格: {message.style}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}