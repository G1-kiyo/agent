// 多页面导航配置
// 改造为 MPA 后，每个页面对应一个独立的 HTML 入口，
// 侧边栏导航通过原生 <a> 标签在页面间跳转，而非 SPA 的状态切换。
export const NAV_ITEMS = [
  {
    key: 'home',
    label: '首页',
    href: './index.html',
    title: '首页',
    subtitle: '让资讯更容易被理解、讨论和分享',
  },
  {
    key: 'search',
    label: '智能检索',
    href: './search.html',
    title: '智能检索',
    subtitle: 'AI智能检索与多轮推理',
  },
  {
    key: 'discussion',
    label: '协同讨论',
    href: './discussion.html',
    title: '协同讨论',
    subtitle: '团队协作与讨论',
  },
  {
    key: 'knowledge',
    label: '知识库',
    href: './knowledge.html',
    title: '知识库',
    subtitle: '知识沉淀与RAG检索',
  },
  {
    key: 'admin',
    label: '管理后台',
    href: './admin.html',
    title: '管理后台',
    subtitle: '系统管理与审核',
  },
]

export const getNavByKey = (key) =>
  NAV_ITEMS.find((item) => item.key === key) || NAV_ITEMS[0]
