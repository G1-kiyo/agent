import { useEffect, useRef } from 'react'
import { Streamdown } from 'streamdown'
import { code } from '@streamdown/code'
import { mermaid } from '@streamdown/mermaid'
import { math } from '@streamdown/math'
import { cjk } from '@streamdown/cjk'
import 'highlight.js/styles/github.css'
import './QaConversation.css'

// 职责：多轮问答展示（流式渲染 + Markdown + 来源引用）
export const QaConversation = ({ conversations, streamingAnswer, isQuerying }) => {
  const scrollRef = useRef(null)

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [conversations, streamingAnswer, isQuerying]) 

  const customComponents = {
    a({ children, href, ...props }) {
      return (
        <a href={href} className="markdown-link" target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      )
    }
  }

  const hasContent = conversations.length > 0 || streamingAnswer || isQuerying

  return (
    <div className="qa-conversation" ref={scrollRef}>
      {!hasContent && (
        <div className="qa-empty">
          <div className="qa-empty-icon">💡</div>
          <p>向知识库提问，获取基于已有文档的增强回答。</p>
          <p className="qa-empty-hint">回答会附带来源引用，可点击溯源。</p>
        </div>
      )}

      {conversations.map((msg, index) => (
        <div key={index} className={`qa-message qa-message-${msg.role}`}>
          <div className="qa-message-role">
            {msg.role === 'user' ? '你' : 'AI 助手'}
          </div>
          <div className="qa-message-content">
            {msg.role === 'assistant' ? (
              <Streamdown plugins={{ code, mermaid, math, cjk }} components={customComponents}>
                {msg.content}
              </Streamdown>
            ) : (
              <p>{msg.content}</p>
            )}
            {msg.role === 'assistant' && msg.sources?.length > 0 && (
              <div className="qa-sources">
                <div className="qa-sources-title">来源引用</div>
                {msg.sources.map((source, sIndex) => (
                  <div key={sIndex} className="qa-source-item">
                    <span className="qa-source-relevance">{source.relevance}%</span>
                    <span className="qa-source-title">{source.title}</span>
                    {source.url && (
                      <a
                        href={source.url}
                        className="qa-source-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        查看
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* 流式输出中的回答 */}
      {isQuerying && (
        <div className="qa-message qa-message-assistant">
          <div className="qa-message-role">AI 助手</div>
          <div className="qa-message-content">
            {streamingAnswer ? (
              <Streamdown plugins={{ code, mermaid, math, cjk }} components={customComponents}>
                {streamingAnswer}
              </Streamdown>
            ) : (
              <span className="qa-typing">
                <span className="pulse-dot"></span>
                正在检索知识库...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
