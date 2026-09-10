/**
 * 历史话题模拟数据
 */

export const mockTopics = [
  {
    id: '1',
    title: '技术架构优化',
    description: '讨论当前系统的架构设计，包括微服务拆分、数据库优化、缓存策略等技术方案的优化方向。',
    category: '技术',
    messageCount: 45,
    participantCount: 12,
    viewCount: 156,
    isActive: true,
    lastActiveTimestamp: Date.now() - 2 * 60 * 60 * 1000, // 2小时前
    tags: ['架构', '性能', '优化'],
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000 // 7天前
  },
  {
    id: '2',
    title: '用户体验改进',
    description: '收集用户反馈，分析产品使用中的痛点，提出改进方案，提升用户满意度。',
    category: '产品',
    messageCount: 32,
    participantCount: 8,
    viewCount: 124,
    isActive: true,
    lastActiveTimestamp: Date.now() - 24 * 60 * 60 * 1000, // 1天前
    tags: ['UX', '用户体验', '界面设计'],
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000 // 14天前
  },
  {
    id: '3',
    title: 'AI应用案例分享',
    description: '分享AI技术在产品中的实际应用案例，包括机器学习模型、自然语言处理、计算机视觉等方面的实践经验。',
    category: '技术',
    messageCount: 28,
    participantCount: 15,
    viewCount: 203,
    isActive: true,
    lastActiveTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3天前
    tags: ['AI', '机器学习', 'NLP'],
    createdAt: Date.now() - 21 * 24 * 60 * 60 * 1000 // 21天前
  },
  {
    id: '4',
    title: '团队协作工具推荐',
    description: '推荐和评估各种团队协作工具，包括项目管理、代码协作、文档管理等工具的优缺点和适用场景。',
    category: '团队',
    messageCount: 19,
    participantCount: 6,
    viewCount: 89,
    isActive: false,
    lastActiveTimestamp: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5天前
    tags: ['协作', '工具', '团队'],
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000 // 30天前
  },
  {
    id: '5',
    title: '代码质量提升方案',
    description: '讨论如何提升代码质量，包括代码审查规范、自动化测试、代码重构、技术债务管理等实践方案。',
    category: '技术',
    messageCount: 36,
    participantCount: 10,
    viewCount: 167,
    isActive: true,
    lastActiveTimestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1天前
    tags: ['代码质量', '测试', '重构'],
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000 // 10天前
  },
  {
    id: '6',
    title: '前端性能优化实践',
    description: '分享前端性能优化的具体实践，包括资源加载优化、渲染性能优化、用户体验优化等方面的经验总结。',
    category: '技术',
    messageCount: 24,
    participantCount: 8,
    viewCount: 145,
    isActive: true,
    lastActiveTimestamp: Date.now() - 6 * 60 * 60 * 1000, // 6小时前
    tags: ['前端', '性能', '优化'],
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000 // 5天前
  },
  {
    id: '7',
    title: '产品设计与用户研究',
    description: '探讨产品设计的核心理念，用户研究方法，以及如何通过设计思维解决实际业务问题。',
    category: '设计',
    messageCount: 31,
    participantCount: 9,
    viewCount: 178,
    isActive: true,
    lastActiveTimestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4天前
    tags: ['设计', '用户体验', '用户研究'],
    createdAt: Date.now() - 18 * 24 * 60 * 60 * 1000 // 18天前
  },
  {
    id: '8',
    title: 'DevOps实践分享',
    description: '分享DevOps在团队中的实践经验，包括CI/CD流程、容器化部署、监控告警等最佳实践。',
    category: '技术',
    messageCount: 27,
    participantCount: 11,
    viewCount: 198,
    isActive: false,
    lastActiveTimestamp: Date.now() - 12 * 24 * 60 * 60 * 1000, // 12天前
    tags: ['DevOps', 'CI/CD', '容器化'],
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000 // 45天前
  }
]

// 搜索功能支持
export const searchTopics = (topics, searchTerm) => {
  if (!searchTerm) return topics
  
  return topics.filter(topic => 
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topic.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )
}

// 分类筛选
export const filterTopicsByCategory = (topics, category) => {
  if (category === 'all') return topics
  return topics.filter(topic => topic.category === category)
}

// 排序功能
export const sortTopics = (topics, sortBy) => {
  const sorted = [...topics]
  
  switch (sortBy) {
    case 'lastActive':
      return sorted.sort((a, b) => b.lastActiveTimestamp - a.lastActiveTimestamp)
    case 'messageCount':
      return sorted.sort((a, b) => b.messageCount - a.messageCount)
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'participantCount':
      return sorted.sort((a, b) => b.participantCount - a.participantCount)
    case 'viewCount':
      return sorted.sort((a, b) => b.viewCount - a.viewCount)
    default:
      return sorted
  }
}

// 时间格式化辅助函数
export const formatTimeAgo = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`
  if (diff < 31536000000) return `${Math.floor(diff / 2592000000)}个月前`
  return `${Math.floor(diff / 31536000000)}年前`
}