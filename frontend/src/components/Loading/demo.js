/**
 * Loading 组件使用示例
 *
 * 全局 Loading API 使用方式：
 * import { loading, GlobalLoading } from '@/components'
 *
 * 或直接从子模块导入：
 * import { loading, GlobalLoading } from '@/components/Common/Loading/GlobalLoading'
 */

// ============================================
// 基础用法
// ============================================

/**
 * 示例 1: 基本使用
 */
const basicExample = async () => {
  // 显示 Loading
  loading.show('正在加载数据...')

  try {
    await fetchSomeData()
  } finally {
    // 隐藏 Loading
    loading.hide()
  }
}

/**
 * 示例 2: 不同尺寸的 Loading
 */
const sizeExample = () => {
  // 小尺寸（无遮罩，适合局部加载）
  loading.small('加载中...')

  // 中尺寸（无遮罩）
  loading.medium('加载中...')

  // 大尺寸（无遮罩）
  loading.large('加载中...')

  // 全屏（带遮罩）
  loading.full('加载中...')

  // 延迟隐藏
  setTimeout(() => {
    loading.hide()
  }, 2000)
}

/**
 * 示例 3: 自定义配置
 */
const customExample = () => {
  GlobalLoading.show('上传文件中...', 'large', true)

  setTimeout(() => {
    // 更新提示文字
    GlobalLoading.update('正在处理...')
  }, 2000)

  setTimeout(() => {
    GlobalLoading.hide()
  }, 4000)
}

// ============================================
// 异步操作包装
// ============================================

/**
 * 示例 4: 使用 wrapAsync 包装异步函数
 */
import { wrapAsync } from './GlobalLoading'

const wrappedFetchData = wrapAsync(
  async () => {
    const data = await fetch('/api/data').then(res => res.json())
    return data
  },
  '获取数据中...'
)

// 使用
const useWrappedExample = async () => {
  // 自动显示/隐藏 Loading
  const data = await wrappedFetchData()
}

/**
 * 示例 5: 使用装饰器（类方法）
 */
import { withLoading } from './GlobalLoading'

class DataService {
  @withLoading('初始化服务...')
  async init() {
    await this.loadData()
    await this.connectDatabase()
  }
}

// ============================================
// 实际业务场景
// ============================================

/**
 * 示例 6: 文件上传
 */
const handleFileUpload = async (file) => {
  loading.show('上传文件中...', 'large', true)

  try {
    // 上传文件
    await uploadFile(file)
    loading.update('正在提取内容...')

    // 提取内容
    const content = await extractContent(file)
    loading.update('正在保存...')

    // 保存到数据库
    await saveContent(content)

    loading.hide()
  } catch (error) {
    loading.hide()
    throw error
  }
}

/**
 * 示例 7: 数据导出
 */
const handleExport = async () => {
  loading.show('导出中...', 'large', true)

  try {
    loading.update('获取数据...')
    const data = await fetchExportData()

    loading.update('生成文件...')
    const blob = await generateExcelFile(data)

    loading.update('下载文件...')
    downloadBlob(blob, 'export.xlsx')

    loading.hide()
  } catch (error) {
    loading.hide()
    throw error
  }
}

/**
 * 示例 8: 批量操作
 */
const handleBatchDelete = async (ids) => {
  loading.show('批量删除中...')

  try {
    for (let i = 0; i < ids.length; i++) {
      loading.update(`删除中... (${i + 1}/${ids.length})`)
      await deleteItem(ids[i])
    }

    loading.hide()
  } catch (error) {
    loading.hide()
    throw error
  }
}

// ============================================
// API 参考
// ============================================

/**
 * loading 对象方法：
 * - show(text, size, overlay) - 显示 Loading
 * - hide() - 隐藏 Loading
 * - small(text) - 显示小尺寸 Loading
 * - medium(text) - 显示中尺寸 Loading
 * - large(text) - 显示大尺寸 Loading
 * - full(text) - 显示全屏 Loading（带遮罩）
 *
 * GlobalLoading 对象方法：
 * - show(text, size, overlay) - 显示 Loading
 * - hide() - 隐藏 Loading
 * - update(text) - 更新提示文字
 *
 * 高级用法：
 * - wrapAsync(fn, text) - 包装异步函数
 * - withLoading(text) - 装饰器（类方法）
 */

// 导出示例函数
export {
  // 基础用法
  basicExample,
  sizeExample,
  customExample,
  // 异步操作包装
  wrappedFetchData,
  // 实际业务场景
  handleFileUpload,
  handleExport,
  handleBatchDelete
}