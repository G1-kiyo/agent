// 知识库 mock 数据
// 对标 components/ComprehensiveResults/data/mockData.js，由 KnowledgePage.jsx 统一 import

// 统计概览
export const mockStats = {
  totalDocs: 24,
  totalTopics: 6,
  weeklyNew: 8
}

// 话题标签云（按文档数量排序）
export const mockTopics = [
  { name: '大模型', count: 9 },
  { name: '融资', count: 6 },
  { name: '技术趋势', count: 5 },
  { name: '行业分析', count: 4 },
  { name: '开源', count: 3 },
  { name: '安全', count: 2 }
]

// 文档列表
export const mockDocuments = [
  {
    id: 'doc-1',
    title: 'OpenAI 发布 GPT-5 模型技术解读',
    summary: 'GPT-5 在推理能力、多模态支持和代码生成方面均有显著改进，支持 100K+ tokens 上下文窗口。',
    source: '智能检索入库',
    sourceUrl: 'https://techcrunch.com/gpt5-announcement',
    createdAt: '2026-07-30 10:30',
    tags: ['大模型', '技术趋势']
  },
  {
    id: 'doc-2',
    title: 'Anthropic 完成 40 亿美元 D 轮融资',
    summary: '由 Google 领投，公司估值达 400 亿美元，资金将用于研发更安全的 AI 系统。',
    source: '智能检索入库',
    sourceUrl: 'https://venturebeat.com/anthropic-funding',
    createdAt: '2026-07-29 09:15',
    tags: ['融资', '安全']
  },
  {
    id: 'doc-3',
    title: 'Meta 发布开源大模型 Llama 3.1',
    summary: '支持商业用途，400B 参数版本在多项基准测试中表现优异，标志开源 AI 战略重要进展。',
    source: '文档上传',
    sourceUrl: '',
    createdAt: '2026-07-28 08:45',
    tags: ['开源', '大模型']
  },
  {
    id: 'doc-4',
    title: '2026 上半年 AI 行业融资全景分析',
    summary: '汇总上半年全球 AI 领域融资事件，总金额突破 800 亿美元，集中在基础模型与垂直应用。',
    source: '文档上传',
    sourceUrl: '',
    createdAt: '2026-07-27 16:20',
    tags: ['融资', '行业分析']
  },
  {
    id: 'doc-5',
    title: 'AI 在医疗影像领域的落地实践',
    summary: '调研 12 家头部医疗 AI 企业，分析影像诊断模型的准确率、监管审批与商业化路径。',
    source: '智能检索入库',
    sourceUrl: 'https://example.com/ai-medical',
    createdAt: '2026-07-26 14:00',
    tags: ['行业分析', '技术趋势']
  }
]

// RAG 检索推荐问题
export const mockRagSuggestions = [
  '上次团队讨论 DeepSeek 的结论是什么？',
  '最近有哪些大模型相关的融资事件？',
  '开源模型和闭源模型的核心差异？',
  'AI 在医疗领域的落地进展如何？'
]

// AI 提取结果模板（按文件类型）
// TXT/MD 由 FileReader 读取真实内容生成更真实的提取结果；
// PDF 前端无法解析，返回固定模板，标题标注「（AI 提取）」前缀
export const mockExtractResult = {
  pdf: {
    title: '（AI 提取）文档标题',
    summary: '（AI 提取）本文档主要探讨了相关主题的核心观点与关键结论，涵盖背景介绍、方法论、实验数据与未来展望等内容。',
    tags: ['大模型', '技术趋势']
  }
}

// 关键词 → 话题标签 映射（用于 TXT/MD 内容命中式 mock 提取）
export const mockKeywordTopicMap = [
  { keywords: ['大模型', 'llm', 'gpt', 'claude', 'deepseek'], topic: '大模型' },
  { keywords: ['融资', '估值', '投资', 'funding', '轮'], topic: '融资' },
  { keywords: ['开源', 'open source', 'github', 'lora'], topic: '开源' },
  { keywords: ['安全', 'safety', '对齐', 'alignment'], topic: '安全' },
  { keywords: ['医疗', '金融', '教育', '行业'], topic: '行业分析' },
  { keywords: ['趋势', '展望', '未来', 'roadmap'], topic: '技术趋势' }
]

// mock RAG 回答（流式渲染用，含来源引用）
export const mockRagAnswer = {
  content: `根据知识库中的文档，**DeepSeek** 团队讨论的核心结论如下：

1. **技术路线**：DeepSeek 采用 MoE 架构，在推理成本上具备显著优势，单位 token 成本约为同级闭源模型的 1/10。
2. **开源策略**：模型权重开源，吸引社区二次微调，形成生态护城河。
3. **商业化**：通过 API 服务与企业定制双轨变现，已在金融、代码助手场景落地。

> 综合判断：DeepSeek 在性价比与开源生态上构建了差异化壁垒，但多模态能力仍需补齐。`,
  sources: [
    { title: 'OpenAI 发布 GPT-5 模型技术解读', relevance: 92, url: 'https://techcrunch.com/gpt5-announcement' },
    { title: 'Meta 发布开源大模型 Llama 3.1', relevance: 85, url: '' },
    { title: '2026 上半年 AI 行业融资全景分析', relevance: 78, url: '' }
  ]
}
