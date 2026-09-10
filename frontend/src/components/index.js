// 通用/共享组件统一导出
// 仅保留跨页面复用的组件，页面专属组件已迁移至对应 pages/<Page>/components 下
export { DocumentUploader } from './DocumentUploader/DocumentUploader'

// Loading 组件（可渲染）和全局 API
export { Loading, InlineLoading } from './Loading/GlobalLoading'
export {
  GlobalLoading,
  loading,
  withLoading as withLoadingDecorator,
  wrapAsync as wrapAsyncWithLoading
} from './Loading/GlobalLoading'

// Alert 组件（可渲染）和全局 API
export { Alert, AlertContainer, AlertType } from './Alert/GlobalAlert'
export {
  GlobalAlert,
  alert,
  withAlert,
  wrapAsyncWithAlert
} from './Alert/GlobalAlert'

export { AuthModal } from './User/AuthModal/AuthModal'
export { Pagination } from './Pagination/Pagination'
export { UserAvatar } from './User/UserAvatar/UserAvatar'
export { UserMenu } from './User/UserMenu/UserMenu'
export { MarkdownResults } from './MarkdownResults/MarkdownResults'

// 通用组件组，便于统一导入
// export const CommonComponents = {
//   DocumentUploader,
//   // Loading
//   Loading,
//   InlineLoading,
//   GlobalLoading,
//   loading,
//   withLoadingDecorator: withLoading,
//   wrapAsyncWithLoading: wrapAsync,
//   // Alert
//   Alert,
//   AlertContainer,
//   AlertType,
//   GlobalAlert,
//   alert,
//   withAlert,
//   wrapAsyncWithAlert
// }
