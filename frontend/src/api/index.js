/**
 * API 统一导出
 * 
 * 使用方式：
 * 
 * // 统一请求封装
 * import { request } from '@/api'
 * 
 * // 认证相关 API
 * import { authApi } from '@/api'
 * await authApi.login(username, password)
 * 
 * // 全部导入
 * import * as api from '@/api'
 * await api.authApi.login(username, password)
 * 
 * // 默认导入请求对象
 * import api from '@/api'
 * await api.request('/endpoint', options, config)
 */

// 导出所有具名导出
export * from './request'
export * from './auth'
export * from './knowledge'
export * from './news'

// 默认导出请求封装对象（向后兼容）
export { default } from './request'