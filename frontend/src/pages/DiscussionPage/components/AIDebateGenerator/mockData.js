/**
 * AI辩论生成器模拟数据
 * 用于演示和测试功能
 */

export const mockDebateTopics = [
  '人工智能在企业中的应用',
  '远程办公的优缺点',
  '社交媒体对青少年的影响',
  '自动化技术对就业的影响',
  '区块链技术的未来前景',
  '电动汽车的普及挑战',
  '云计算的安全风险',
  '大数据隐私保护',
  '机器学习的伦理问题',
  '物联网的发展前景'
]

export const mockDebateStyles = [
  {
    id: 'balanced',
    name: '均衡辩论',
    description: '正反双方观点平衡展示',
    keywords: ['客观', '平衡', '全面', '中性']
  },
  {
    id: 'critical',
    name: '深度批判',
    description: '深入分析各方观点的优缺点',
    keywords: ['批判', '分析', '优缺点', '深入']
  },
  {
    id: 'practical',
    name: '实用主义',
    description: '从实际应用角度分析问题',
    keywords: ['实用', '应用', '实践', '落地']
  },
  {
    id: 'theoretical',
    name: '理论探讨',
    description: '从理论和原理层面深入讨论',
    keywords: ['理论', '原理', '学术', '深入']
  }
]

export const mockDebateRoles = [
  {
    id: 'supporter',
    name: '支持方',
    description: '支持议题的积极观点',
    color: '#10b981',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=supporter'
  },
  {
    id: 'opposer',
    name: '反对方',
    description: '反对议题的批判观点',
    color: '#ef4444',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=opposer'
  }
]

export const mockDebateTemplates = {
  '人工智能在企业中的应用': {
    supporter: [
      'AI能够显著提升企业决策效率，通过数据分析提供精准的洞察。',
      '自动化流程可以大幅减少人工错误，提高工作质量。',
      'AI系统能够24/7不间断工作，大幅提升生产力。'
    ],
    opposer: [
      'AI系统的初始投入成本非常高，中小企业难以承受。',
      '过度依赖AI可能导致人类技能退化，影响长期发展。',
      'AI系统的维护和更新需要专业团队，增加了运营成本。'
    ]
  },
  '远程办公的优缺点': {
    supporter: [
      '远程办公可以节省通勤时间，提高员工生活质量。',
      '企业可以招聘全球人才，不受地理位置限制。',
      '减少办公空间需求，降低企业运营成本。'
    ],
    opposer: [
      '远程办公可能导致团队协作效率下降。',
      '缺乏面对面交流，影响企业文化建设。',
      '员工可能面临工作生活界限模糊的问题。'
    ]
  },
  '社交媒体对青少年的影响': {
    supporter: [
      '社交媒体为青少年提供了广阔的社交平台。',
      '有助于培养数字化技能，为未来发展做准备。',
      '可以获取丰富的知识和信息资源。'
    ],
    opposer: [
      '社交媒体可能分散青少年的注意力，影响学习。',
      '存在网络欺凌和隐私风险。',
      '过度使用可能导致心理健康问题。'
    ]
  }
}

export const mockDebateStats = {
  avgGenerationTime: 2.5,
  successRate: 0.95,
  totalDebatesGenerated: 1247,
  messagesPerDebate: 4.2
}

export const mockErrorMessages = [
  'AI服务暂时不可用，请稍后重试。',
  '网络连接异常，请检查网络设置。',
  '生成请求过于频繁，请稍后再试。',
  '辩论主题过于敏感，请更换其他主题。'
]