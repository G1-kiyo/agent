import './AgentStatus.css'

export const AgentStatus = ({ iterationCount, isSearching }) => {
  if (!isSearching) return null

  const steps = [
    {
      number: 1,
      title: '分析查询',
      description: '理解用户意图，确定搜索策略'
    },
    {
      number: 2,
      title: '检索信息',
      description: '调用搜索API获取相关信息'
    },
    {
      number: iterationCount || 3,
      title: '多轮推理',
      description: '迭代完善搜索结果'
    }
  ]

  return (
    <div className="agent-status">
      <h4>Agent执行状态</h4>
      <div className="agent-info">
        {steps.map((step, index) => (
          <div key={index} className={`agent-step ${step.number === iterationCount ? 'active' : ''}`}>
            <span className="step-number">{step.number}</span>
            <div className="step-content">
              <h5>{step.title}</h5>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}