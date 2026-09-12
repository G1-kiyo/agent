import { createRoot } from 'react-dom/client'
import './GlobalLoading.css'

/**
 * Loading 组件（可直接渲染）
 * @param {boolean} visible - 是否显示 loading
 * @param {string} text - 加载提示文字
 * @param {string} size - 尺寸: 'small' | 'medium' | 'large' | 'full'
 * @param {boolean} overlay - 是否使用遮罩层（全屏加载时使用）
 */
export const Loading = ({
  visible = true,
  text = '加载中...',
  size = 'medium',
  overlay = false,
  className = ''
}) => {
  if (!visible) return null

  const sizeClass = `loading-${size}`
  const overlayClass = overlay ? 'loading-overlay' : ''

  return (
    <div className={`loading-container ${overlayClass} ${className}`}>
      <div className={`loading-spinner ${sizeClass}`}>
        <div className="loading-ring"></div>
        <div className="loading-ring"></div>
        <div className="loading-ring"></div>
        <div className="loading-ring"></div>
      </div>
      {text && <div className={`loading-text ${sizeClass}`}>{text}</div>}
    </div>
  )
}

/**
 * 行内 Loading 组件（用于局部加载，不带遮罩）
 */
export const InlineLoading = ({ text = '加载中...', size = 'small', className = '' }) => {
  return (
    <div className={`inline-loading ${className}`}>
      <div className={`loading-spinner loading-${size}`}>
        <div className="loading-ring"></div>
        <div className="loading-ring"></div>
        <div className="loading-ring"></div>
        <div className="loading-ring"></div>
      </div>
      {text && <span className={`loading-text loading-${size}`}>{text}</span>}
    </div>
  )
}

// ============================================
// 全局 API 实现
// ============================================

let loadingRoot = null
let loadingContainer = null

/**
 * Loading 实例组件
 */
const LoadingInstance = ({ visible, text, size, overlay }) => {
  return (
    <Loading
      visible={visible}
      text={text}
      size={size}
      overlay={overlay}
    />
  )
}

/**
 * 初始化 Loading 容器
 */
const initLoadingContainer = () => {
  if (!loadingContainer) {
    loadingContainer = document.createElement('div')
    loadingContainer.id = 'global-loading-container'
    document.body.appendChild(loadingContainer)
    loadingRoot = createRoot(loadingContainer)
  }
}

/**
 * 显示 Loading
 * @param {string} text - 加载提示文字
 * @param {string} size - 尺寸: 'small' | 'medium' | 'large' | 'full'
 * @param {boolean} overlay - 是否使用遮罩层
 */
export const show = (text = '加载中...', size = 'medium', overlay = true) => {
  initLoadingContainer()

  loadingRoot.render(
    <LoadingInstance
      visible={true}
      text={text}
      size={size}
      overlay={overlay}
    />
  )
}

/**
 * 隐藏 Loading
 */
export const hide = () => {
  if (!loadingContainer || !loadingRoot) return

  loadingRoot.render(
    <LoadingInstance
      visible={false}
      text=""
      size="medium"
      overlay={false}
    />
  )
}

/**
 * 更新 Loading 状态
 * @param {string} text - 新的提示文字
 */
export const update = (text) => {
  if (!loadingContainer || !loadingRoot) return

  // 先卸载，再重新渲染（简单实现）
  // 如果需要更复杂的更新逻辑，可以使用 state 管理
  hide()
  setTimeout(() => {
    show(text)
  }, 10)
}

/**
 * 导出全局 Loading 对象
 */
export const GlobalLoading = {
  show,
  hide,
  update
}

/**
 * 快捷调用方法
 * 这些方法会自动使用默认配置
 */
export const loading = {
  /**
   * 显示 Loading
   */
  show: (text, size, overlay) => GlobalLoading.show(text, size, overlay),

  /**
   * 隐藏 Loading
   */
  hide: () => GlobalLoading.hide(),

  /**
   * 显示小尺寸 Loading
   */
  small: (text = '加载中...') => GlobalLoading.show(text, 'small', false),

  /**
   * 显示中尺寸 Loading
   */
  medium: (text = '加载中...') => GlobalLoading.show(text, 'medium', false),

  /**
   * 显示大尺寸 Loading
   */
  large: (text = '加载中...') => GlobalLoading.show(text, 'large', false),

  /**
   * 显示全屏 Loading（带遮罩）
   */
  full: (text = '加载中...') => GlobalLoading.show(text, 'full', true)
}

/**
 * 自动 Loading 装饰器
 * 用于包装异步函数，自动显示/隐藏 Loading
 * @param {string} text - Loading 提示文字
 * @param {string} size - 尺寸
 * @param {boolean} overlay - 是否带遮罩
 * @returns {Function} 装饰后的函数
 */
export const withLoading = (text = '处理中...', size = 'medium', overlay = true) => {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args) {
      try {
        GlobalLoading.show(text, size, overlay)
        const result = await originalMethod.apply(this, args)
        GlobalLoading.hide()
        return result
      } catch (error) {
        GlobalLoading.hide()
        throw error
      }
    }

    return descriptor
  }
}

/**
 * 创建带 Loading 的异步函数包装器
 * @param {Function} asyncFn - 异步函数
 * @param {string} text - Loading 提示文字
 * @returns {Function} 包装后的函数
 */
export const wrapAsync = (asyncFn, text = '加载中...') => {
  return async (...args) => {
    try {
      GlobalLoading.show(text)
      const result = await asyncFn(...args)
      GlobalLoading.hide()
      return result
    } catch (error) {
      GlobalLoading.hide()
      throw error
    }
  }
}