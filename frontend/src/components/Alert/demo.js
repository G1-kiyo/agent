/**
 * Alert 组件使用示例
 *
 * 全局 Alert API 使用方式：
 * import { alert, GlobalAlert } from '@/components'
 *
 * 或直接从子模块导入：
 * import { alert, GlobalAlert } from '@/components/Common/Alert/GlobalAlert'
 */

// ============================================
// 基础用法
// ============================================

/**
 * 示例 1: 基本使用（推荐）
 */
const basicExample = () => {
  // 成功提示（默认 3 秒后自动关闭）
  alert.success('操作成功！')

  // 错误提示（默认 5 秒后自动关闭）
  alert.error('操作失败！')

  // 警告提示（默认 4 秒后自动关闭）
  alert.warning('请注意！')

  // 信息提示（默认 3 秒后自动关闭）
  alert.info('系统消息')
}

/**
 * 示例 2: 自定义关闭时间
 */
const customDurationExample = () => {
  // 10 秒后自动关闭
  alert.success('操作成功！', 10000)

  // 不自动关闭（传入 0）
  alert.error('严重错误，请手动处理', 0)

  // 2 秒后快速关闭
  alert.info('提示信息', 2000)
}

/**
 * 示例 3: 使用全局 API
 */
const globalApiExample = () => {
  GlobalAlert.success('保存成功')
  GlobalAlert.error('保存失败')
  GlobalAlert.warning('请注意')
  GlobalAlert.info('提示信息')

  // 自定义类型和时长
  GlobalAlert.show('自定义消息', 'info', 5000)

  // 清空所有提示
  GlobalAlert.clearAll()
}

// ============================================
// 异步操作包装
// ============================================

/**
 * 示例 4: 使用 withAlert 包装 Promise
 */
import { withAlert } from './GlobalAlert'

const promiseExample = async () => {
  await withAlert(
    fetch('/api/data'),
    {
      successMessage: '数据加载成功',
      errorMessage: '数据加载失败',
      showSuccess: true,
      showError: true
    }
  )
}

/**
 * 示例 5: 使用 wrapAsyncWithAlert 包装函数
 */
import { wrapAsyncWithAlert } from './GlobalAlert'

const wrappedSaveData = wrapAsyncWithAlert(
  async (data) => {
    await fetch('/api/data', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },
  {
    successMessage: '数据保存成功',
    errorMessage: '数据保存失败'
  }
)

// 使用
const saveDataExample = async () => {
  await wrappedSaveData({ name: 'John' })
}

/**
 * 示例 6: 自定义包装函数
 */
const wrappedDelete = wrapAsyncWithAlert(
  async (id) => {
    await fetch(`/api/items/${id}`, { method: 'DELETE' })
  },
  {
    successMessage: '删除成功',
    errorMessage: '删除失败',
  }
)

// ============================================
// 实际业务场景
// ============================================

/**
 * 示例 7: 表单提交
 */
const handleFormSubmit = async (formData) => {
  // 验证
  if (!formData.name) {
    alert.warning('请填写名称')
    return
  }

  try {
    await submitForm(formData)
    alert.success('提交成功')
  } catch (error) {
    alert.error('提交失败：' + error.message)
  }
}

/**
 * 示例 8: 删除操作
 */
const handleDelete = async (id) => {
  if (!confirm('确定要删除吗？')) {
    return
  }

  try {
    await deleteItem(id)
    alert.success('删除成功')
  } catch (error) {
    alert.error('删除失败：' + error.message)
  }
}

/**
 * 示例 9: 保存操作
 */
const handleSave = async (data) => {
  // 验证
  if (!data.title) {
    alert.warning('请填写标题')
    return
  }

  if (data.title.length > 100) {
    alert.warning('标题不能超过100个字符')
    return
  }

  try {
    await saveData(data)
    alert.success('保存成功')
  } catch (error) {
    alert.error('保存失败：' + error.message)
    throw error
  }
}

/**
 * 示例 10: 批量操作结果提示
 */
const handleBatchResult = (successCount, failCount) => {
  if (failCount === 0) {
    alert.success(`成功处理 ${successCount} 个项目`)
  } else if (successCount === 0) {
    alert.error(`处理失败，共 ${failCount} 个项目`)
  } else {
    alert.warning(`处理完成：成功 ${successCount} 个，失败 ${failCount} 个`)
  }
}

/**
 * 示例 11: API 错误提示
 */
const handleApiError = (error) => {
  if (error.response?.status === 401) {
    alert.error('登录已过期，请重新登录')
  } else if (error.response?.status === 403) {
    alert.error('没有操作权限')
  } else if (error.response?.status === 500) {
    alert.error('服务器错误，请稍后重试')
  } else {
    alert.error('操作失败：' + (error.message || '未知错误'))
  }
}

// ============================================
// 与 Loading 组合使用
// ============================================

/**
 * 示例 12: Loading + Alert 组合
 */
import { loading } from '../Loading/GlobalLoading'

const handleUpload = async (file) => {
  loading.show('上传中...', 'large', true)

  try {
    await uploadFile(file)
    loading.hide()
    alert.success('上传成功')
  } catch (error) {
    loading.hide()
    alert.error('上传失败：' + error.message)
  }
}

/**
 * 示例 13: CRUD 操作完整示例
 */
const handleCreate = async (data) => {
  loading.show('创建中...')

  try {
    const result = await createItem(data)
    loading.hide()
    alert.success('创建成功')
    return result
  } catch (error) {
    loading.hide()
    alert.error('创建失败：' + error.message)
    throw error
  }
}

const handleUpdate = async (id, data) => {
  loading.show('更新中...')

  try {
    await updateItem(id, data)
    loading.hide()
    alert.success('更新成功')
  } catch (error) {
    loading.hide()
    alert.error('更新失败：' + error.message)
    throw error
  }
}

// ============================================
// API 参考
// ============================================

/**
 * alert 对象方法：
 * - success(message, duration) - 成功提示
 * - error(message, duration) - 错误提示
 * - warning(message, duration) - 警告提示
 * - info(message, duration) - 信息提示
 * - show(message, type, duration) - 自定义提示
 * - clear() - 清空所有提示
 *
 * GlobalAlert 对象方法：
 * - show(message, type, duration, closable) - 显示提示
 * - success(message, duration) - 成功提示
 * - error(message, duration) - 错误提示
 * - warning(message, duration) - 警告提示
 * - info(message, duration) - 信息提示
 * - remove(id) - 移除指定提示
 * - clearAll() - 清空所有提示
 *
 * 高级用法：
 * - withAlert(promise, options) - 包装 Promise
 * - wrapAsyncWithAlert(fn, options) - 包装异步函数
 */

// 导出示例函数
export {
  // 基础用法
  basicExample,
  customDurationExample,
  globalApiExample,
  // 异步操作包装
  promiseExample,
  wrappedSaveData,
  wrappedDelete,
  // 实际业务场景
  handleFormSubmit,
  handleDelete,
  handleSave,
  handleBatchResult,
  handleApiError,
  // 与 Loading 组合
  handleUpload,
  handleCreate,
  handleUpdate
}