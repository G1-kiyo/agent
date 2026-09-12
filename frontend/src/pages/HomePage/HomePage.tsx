import { useState } from 'react'
import './HomePage.css'

const topics = [
  {
    title: '实时 AI 资讯流',
    text: '把最新动态与团队讨论聚合到同一条时间线里。',
  },
  {
    title: '社群级协作',
    text: '成员可以共同追问、补充证据、对比结论。',
  },
  {
    title: '可信审计',
    text: '每一步检索和决策都能被回放，建立信任。',
  },
]

const workflowItems = [
  {
    title: '一键发起搜索',
    text: '用户输入一条问题，AI 会自动发起检索与摘要。',
  },
  {
    title: '人工确认审核',
    text: '在发布前确认关键搜索词和结果质量。',
  },
  {
    title: '分叉出讨论',
    text: '从同一条资讯继续展开不同角度的辩论。',
  },
  {
    title: '生成可追溯结论',
    text: '最终结论可以被回放、分享与沉淀为知识。',
  },
]

const starterMessages = [
  {
    role: 'assistant',
    content: '欢迎来到 AI 资讯协作平台。你可以在这里快速追踪热点、讨论观点，并把结论沉淀成可分享的内容。',
    meta: 'AI 助手 · 已就绪',
  },
  {
    role: 'assistant',
    content: '你可以直接这样提问：\
• "最近有哪些值得关注的 AI 动态？"\
• "把这条资讯整理成一段适合发给团队的摘要"',
    meta: '体验提示',
  },
]

/**
 * 首页内容：核心体验卡片 + 互动聊天 + 产品流程。
 * 原先承载在 App.jsx 中的首页区块，MPA 改造后拆分为独立页面组件。
 */
export const HomePage = () => {
  const [messages, setMessages] = useState(starterMessages)
  const [input, setInput] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const value = input.trim()
    if (!value) return

    setMessages((prev) => [...prev, { role: 'user', content: value, meta: '你 · 刚刚' }])
    setInput('')

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '已为你整理出一条更适合团队分享的结论，并把讨论线索保存在当前会话中。',
          meta: 'AI 助手 · 已生成',
        },
      ])
    }, 350)
  }

  const handleChipClick = (text) => {
    setInput(text)
  }

  return (
    <>
      <section className="hero-grid">
        <div className="hero-card highlight-card">
          <p className="label">核心体验</p>
          <h3>把"看资讯"变成"讨论与产出"</h3>
          <p>用户不再只是被动接收信息，而是能和 AI 共同整理、追问和输出可传播的结果。</p>
          <div className="pill-row">
            <span className="pill">实时摘要</span>
            <span className="pill">团队讨论</span>
            <span className="pill">可分享结论</span>
          </div>
        </div>

        <div className="hero-card">
          <p className="label">热门话题</p>
          <div className="topic-list">
            {topics.map((topic) => (
              <div key={topic.title} className="topic-card">
                <h4>{topic.title}</h4>
                <p>{topic.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="content-grid">
        <div className="chat-card">
          <div className="chat-header">
            <div>
              <p className="eyebrow">互动体验</p>
              <h3>和 AI 一起整理资讯</h3>
            </div>
            <span className="status-pill">在线</span>
          </div>

          <div className="message-list">
            {messages.map((msg, index) => (
              <div key={`${msg.role}-${index}`} className={`message ${msg.role}`}>
                <div>{msg.content}</div>
                <span className="meta">{msg.meta}</span>
              </div>
            ))}
          </div>

          <div className="quick-prompts">
            <button className="chip" onClick={() => handleChipClick('总结今天资讯')}>
              总结今天资讯
            </button>
            <button className="chip" onClick={() => handleChipClick('生成团队摘要')}>
              生成团队摘要
            </button>
            <button className="chip" onClick={() => handleChipClick('提炼关键观点')}>
              提炼关键观点
            </button>
          </div>

          <form className="composer" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你想了解的资讯或想要的输出..."
            />
            <button type="submit">发送</button>
          </form>
        </div>

        <div className="insight-card">
          <div className="insight-header">
            <div>
              <p className="eyebrow">产品流程</p>
              <h3>从问题到结论</h3>
            </div>
            <span className="badge">简洁流程</span>
          </div>

          <div className="workflow-list">
            {workflowItems.map((item) => (
              <div key={item.title} className="workflow-card">
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
