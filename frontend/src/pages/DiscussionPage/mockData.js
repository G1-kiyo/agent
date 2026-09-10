/**
 * DiscussionPage Mock数据
 * 为各个组件提供模拟数据用于开发和测试
 */

// 模拟讨论数据
export const mockDiscussion = {
  id: 'discussion-12345',
  title: 'AI技术在企业管理中的应用与挑战',
  description: '探讨AI技术如何帮助企业提升效率、优化决策，以及在实施过程中可能遇到的挑战和解决方案。欢迎各位专家分享宝贵经验和见解。',
  creator: '张明',
  createdAt: '2024-01-15T09:30:00Z',
  status: 'active',
  tags: ['#AI技术', '#企业管理', '#数字化转型', '#效率提升'],
  isFork: false,
  parentTopic: null,
  messageCount: 23,
  replyCount: 18,
  participantCount: 12,
  viewCount: 156,
  category: '技术讨论',
  priority: 'high',
  estimatedDuration: 7, // 天
  lastActivity: '2024-01-15T14:20:00Z',
  engagementRate: 78, // 参与率
  averageResponseTime: '15分钟', // 平均响应时间
  averageResponseTime: '15分钟',
  engagementRate: 78
}

// 模拟消息数据
export const mockMessages = [
  {
    id: 'msg-1',
    content: '我认为AI在企业管理中最有价值的应用是数据分析和预测，这可以帮助企业做出更明智的决策。',
    author: '李华',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=李华',
    createdAt: '2024-01-15T09:45:00Z',
    type: 'text',
    replyTo: null,
    reactions: [
      { type: '👍', users: ['王强', '当前用户'], count: 3 },
      { type: '💡', users: ['赵敏'], count: 2 }
    ],
    votes: [],
    edited: false,
    isHighlighted: false
  },
  {
    id: 'msg-2',
    content: '确实如此！不过实施AI系统最大的挑战在于数据质量和数据治理。很多企业的数据都很分散且格式不统一。',
    author: '王强',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=王强',
    createdAt: '2024-01-15T10:15:00Z',
    type: 'text',
    replyTo: 'msg-1',
    reactions: [
      { type: '👍', users: ['李华', '当前用户'], count: 2 },
      { type: '🤔', users: ['张三'], count: 1 }
    ],
    votes: [],
    edited: false,
    isHighlighted: true
  },
  {
    id: 'msg-3',
    content: '关于数据治理，我们公司使用了一个统一的数据中台，整合了各个业务系统的数据，效果还不错。',
    author: '赵敏',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=赵敏',
    createdAt: '2024-01-15T10:45:00Z',
    type: 'text',
    replyTo: 'msg-2',
    reactions: [
      { type: '👍', users: ['王强'], count: 1 },
      { type: '✨', users: ['李华', '当前用户'], count: 1 }
    ],
    votes: [],
    edited: false,
    isHighlighted: false
  },
  {
    id: 'msg-4',
    content: '除了数据治理，AI人才的缺乏也是一个大问题。很多企业愿意投入资金，但找不到合适的人才来实施。',
    author: '张三',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=张三',
    createdAt: '2024-01-15T11:30:00Z',
    type: 'text',
    replyTo: null,
    reactions: [
      { type: '👍', users: ['李华', '当前用户', '张三'], count: 4 },
      { type: '🎯', users: ['王强'], count: 2 }
    ],
    votes: [],
    edited: false,
    isHighlighted: false
  },
  {
    id: 'msg-5',
    content: '说到人才，我建议可以考虑和高校合作，或者引入一些开源工具降低技术门槛。另外，从简单的场景开始，比如智能客服，也是一个不错的切入点。',
    author: '李四',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=李四',
    createdAt: '2024-01-15T12:00:00Z',
    type: 'text',
    replyTo: 'msg-4',
    reactions: [
      { type: '💯', users: ['张三', '当前用户'], count: 3 },
      { type: '👍', users: ['王强'], count: 2 },
      { type: '🌟', users: ['赵敏'], count: 1 }
    ],
    votes: [],
    edited: false,
    isHighlighted: false
  },
  {
    id: 'msg-6',
    content: '大家觉得AI在人力资源管理方面有哪些应用？比如招聘、培训、绩效评估等。',
    author: '王五',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=王五',
    createdAt: '2024-01-15T13:15:00Z',
    type: 'text',
    replyTo: null,
    reactions: [
      { type: '🤔', users: ['李华'], count: 1 }
    ],
    votes: [],
    edited: false,
    isHighlighted: true
  },
  {
    id: 'msg-7',
    content: 'AI在招聘方面可以做简历筛选、职位匹配，培训方面可以做个性化学习路径推荐，绩效评估可以通过数据分析提供更客观的评估。',
    author: '赵敏',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=赵敏',
    createdAt: '2024-01-15T13:45:00Z',
    type: 'text',
    replyTo: 'msg-6',
    reactions: [
      { type: '👍', users: ['王五', '当前用户'], count: 2 },
      { type: '📊', users: ['张三'], count: 1 }
    ],
    votes: [],
    edited: false,
    isHighlighted: false
  },
  {
    id: 'msg-8',
    content: '除了刚才提到的，AI还可以用于员工流失预测，帮助企业提前采取措施挽留关键人才。',
    author: '钱六',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=钱六',
    createdAt: '2024-01-15T14:00:00Z',
    type: 'text',
    replyTo: 'msg-6',
    reactions: [
      { type: '💡', users: ['赵敏', '当前用户'], count: 2 },
      { type: '👍', users: ['王五'], count: 1 }
    ],
    votes: [],
    edited: false,
    isHighlighted: false
  }
]

// 模拟投票数据
export const mockVotes = [
  {
    id: 'vote-1',
    discussionId: 'discussion-12345',
    question: '您认为AI技术在企业管理中哪个方面最有价值？',
    options: [
      {
        id: 'option-1',
        text: '数据分析和决策支持',
        votes: 8,
        color: '#1da1f2'
      },
      {
        id: 'option-2',
        text: '自动化流程和效率提升',
        votes: 5,
        color: '#17bf63'
      },
      {
        id: 'option-3',
        text: '客户体验优化',
        votes: 3,
        color: '#ff6b6b'
      },
      {
        id: 'option-4',
        text: '风险预测和管理',
        votes: 4,
        color: '#ffa502'
      }
    ],
    totalVotes: 20,
    isActive: true,
    createdAt: '2024-01-15T09:30:00Z',
    endsAt: '2024-01-16T09:30:00Z',
    creator: '张明'
  }
]

// 模拟分叉历史数据
export const mockForkHistory = [
  {
    id: 'fork-1',
    originalId: 'discussion-12345',
    title: 'AI技术在零售业的应用',
    creator: '李华',
    createdAt: '2024-01-14T15:30:00Z',
    participantCount: 5,
    messageCount: 12,
    status: 'active'
  },
  {
    id: 'fork-2',
    originalId: 'discussion-12345',
    title: 'AI在金融行业的挑战',
    creator: '王强',
    createdAt: '2024-01-13T10:15:00Z',
    participantCount: 8,
    messageCount: 16,
    status: 'archived'
  },
  {
    id: 'fork-3',
    originalId: 'discussion-12345',
    title: '制造业AI实施案例分享',
    creator: '赵敏',
    createdAt: '2024-01-12T14:45:00Z',
    participantCount: 6,
    messageCount: 9,
    status: 'active'
  }
]

// 模拟用户数据
export const mockUsers = [
  {
    id: 'user-1',
    name: '张明',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=张明',
    role: '产品经理',
    department: '产品部'
  },
  {
    id: 'user-2',
    name: '李华',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=李华',
    role: '技术专家',
    department: '技术部'
  },
  {
    id: 'user-3',
    name: '王强',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=王强',
    role: '数据分析师',
    department: '数据部'
  },
  {
    id: 'user-4',
    name: '赵敏',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=赵敏',
    role: '解决方案架构师',
    department: '技术部'
  },
  {
    id: 'user-5',
    name: '张三',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=张三',
    role: '业务顾问',
    department: '咨询部'
  }
]

// 模拟讨论选项
export const mockDiscussionOptions = [
  { value: '技术讨论', label: '技术讨论' },
  { value: '产品规划', label: '产品规划' },
  { value: '项目管理', label: '项目管理' },
  { value: '用户体验', label: '用户体验' },
  { value: '运营策略', label: '运营策略' }
]

// 模拟标签选项
export const mockTagOptions = [
  '#AI技术',
  '#数字化转型',
  '#效率提升',
  '#成本优化',
  '#用户体验',
  '#数据分析',
  '#自动化',
  '#创新',
  '#趋势',
  '#最佳实践'
]

// 模拟加载状态
export const mockLoadingStates = {
  discussion: false,
  messages: false,
  voting: false,
  forking: false,
  creating: false
}

// 模拟历史话题数据
export const mockHistoricalTopics = [
  {
    id: 'topic-1',
    title: 'AI技术在企业管理中的应用与挑战',
    description: '探讨AI技术如何帮助企业提升效率、优化决策，以及在实施过程中可能遇到的挑战和解决方案。',
    category: '技术',
    messageCount: 45,
    participantCount: 12,
    viewCount: 156,
    isActive: true,
    lastActiveTimestamp: Date.now() - 2 * 60 * 60 * 1000,
    tags: ['AI', '企业管理', '数字化转型'],
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    isBookmarked: true
  },
  {
    id: 'topic-2',
    title: '用户体验改进方案讨论',
    description: '收集用户反馈，分析产品使用中的痛点，提出改进方案，提升用户满意度。',
    category: '产品',
    messageCount: 32,
    participantCount: 8,
    viewCount: 124,
    isActive: true,
    lastActiveTimestamp: Date.now() - 24 * 60 * 60 * 1000,
    tags: ['UX', '用户体验', '设计'],
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    isBookmarked: false
  },
  {
    id: 'topic-3',
    title: '数字化转型策略实施',
    description: '制定和讨论企业数字化转型战略，包括技术选型、组织变革、人才培养等方面的实施方案。',
    category: '战略',
    messageCount: 28,
    participantCount: 15,
    viewCount: 203,
    isActive: true,
    lastActiveTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    tags: ['数字化', '转型', '战略'],
    createdAt: Date.now() - 21 * 24 * 60 * 60 * 1000,
    isBookmarked: true
  },
  {
    id: 'topic-4',
    title: '云原生架构设计最佳实践',
    description: '分享云原生架构设计的经验，包括容器化、微服务、服务网格、DevOps流程等方面的最佳实践。',
    category: '技术',
    messageCount: 56,
    participantCount: 20,
    viewCount: 289,
    isActive: true,
    lastActiveTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    tags: ['云计算', '架构', '容器'],
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    isBookmarked: false
  },
  {
    id: 'topic-5',
    title: '敏捷开发流程优化',
    description: '讨论敏捷开发流程的优化方案，包括Scrum实践、迭代规划、需求管理、质量保证等方面的改进措施。',
    category: '项目管理',
    messageCount: 19,
    participantCount: 6,
    viewCount: 89,
    isActive: false,
    lastActiveTimestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
    tags: ['敏捷', '流程', '项目管理'],
    createdAt: Date.now() - 35 * 24 * 60 * 60 * 1000,
    isBookmarked: false
  }
]

// 模拟错误信息
export const mockErrors = {
  discussion: null,
  messages: null,
  voting: null,
  forking: null,
  creating: null
}