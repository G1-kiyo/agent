import { Streamdown } from "streamdown";
import { code } from "@streamdown/code";
import { mermaid } from "@streamdown/mermaid";
import { math } from "@streamdown/math";
import { cjk } from "@streamdown/cjk";
import "katex/dist/katex.min.css";


export const MarkdownResults = ({ content }) => {
  // 自定义渲染组件
  const customComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <pre className="code-block">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      ) : (
        <code className="inline-code" {...props}>
          {children}
        </code>
      )
    },
    table({ children }) {
      return (
        <div className="table-container">
          <table className="markdown-table">
            {children}
          </table>
        </div>
      )
    },
    a({ children, href, ...props }) {
      return (
        <a href={href} className="markdown-link" target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      )
    },
    img({ src, alt, ...props }) {
      return (
        <div className="image-container">
          <img src={src} alt={alt} className="markdown-image" {...props} />
        </div>
      )
    }
  }

  return (
    <Streamdown
      plugins={{ code, mermaid, math, cjk }}
      components={customComponents}
    >
      {content}
    </Streamdown>
  )
}