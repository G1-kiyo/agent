// MPA 改造后，原 App 的内容已拆分：
// - 外层布局（侧边栏/顶部栏）→ ./layouts/AppLayout
// - 首页内容 → ./pages/HomePage
// 此处仅保留具名/默认导出，兼容历史引用。
export { HomePage, HomePage as default } from './pages/HomePage'