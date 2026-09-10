import { createRoot } from 'react-dom/client'
import React, { useState, useEffect } from 'react'
import { useBoundStore } from '../../store'
import './GlobalAlert.css'
/**
 * Alert 类型常量
 */
export const AlertType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

/**
 * 获取对应类型的图标
 */
const getIcon = (type) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type] || icons.info
}

/**
 * Alert 组件（可直接渲染）
 * @param {boolean} visible - 是否显示
 * @param {string} message - 提示消息
 * @param {string} type - 类型: 'success' | 'error' | 'warning' | 'info'
 * @param {number} duration - 自动关闭时间（毫秒），0 表示不自动关闭
 * @param {Function} onClose - 关闭回调
 * @param {boolean} closable - 是否显示关闭按钮
 */
export const Alert = ({
  visible = true,
  message = '',
  type = 'info',
  duration = 3000,
  onClose,
  closable = true
}) => {
  useEffect(() => {
    // 自动关闭
    if (visible && duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible, duration, onClose])

  if (!visible) return null

  const typeClass = `alert-${type}`

  return (
    <div className={`alert-container ${typeClass}`}>
      <div className="alert-content">
        <span className="alert-icon">{getIcon(type)}</span>
        <span className="alert-message">{message}</span>
        {closable && (
          <button
            className="alert-close"
            onClick={onClose}
            aria-label="关闭"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Alert 容器组件（用于管理多个 Alert）
 */
export const AlertContainer = ({ alerts = [], onClose }) => {
  return (
    <div className="alert-container-wrapper">
      {alerts.map((alert, index) => (
        <Alert
          key={index}
          visible={alert.visible}
          message={alert.message}
          type={alert.type}
          duration={alert.duration}
          closable={alert.closable}
          onClose={() => onClose(alert.id)}
        />
      ))}
    </div>
  )
}

// ============================================
// 全局 API 实现
// ============================================

let alertRoot = null
let alertContainer = null
let alerts = []
let updateAlerts = null

/**
 * Alert 管理器组件
 */
const AlertManager = () => {
  // console.log("store",useAlertStore.getInitialState())
  const alertList = useBoundStore((state) => state.alerts)

  return (
    <AlertContainer
      alerts={alertList}
      onClose={(id) => {
        removeAlert(id)
      }}
    />
  )
}

/**
 * 初始化 Alert 容器
 */
const initAlertContainer = () => {
  if (!alertContainer) {
    alertContainer = document.createElement('div')
    alertContainer.id = 'global-alert-container'
    document.body.appendChild(alertContainer)
    alertRoot = createRoot(alertContainer)

    // 渲染 Alert 管理器
    alertRoot.render(<AlertManager />)
  }
}

/**
 * 添加 Alert
 * @param {string} message - 提示消息
 * @param {string} type - 类型: 'success' | 'error' | 'warning' | 'info'
 * @param {number} duration - 自动关闭时间（毫秒），0 表示不自动关闭
 * @param {boolean} closable - 是否显示关闭按钮
 * @returns {string} Alert ID
 */
const showAlert = (message, type = 'info', duration = 3000, closable = true) => {
  initAlertContainer()

  const id = Date.now() + Math.random().toString(36).slice(2)

  const newAlert = {
    id,
    message,
    type,
    duration,
    closable,
    visible: true
  }
  useBoundStore.getState().addAlert(newAlert)
  return id
}

/**
 * 移除 Alert
 * @param {string} id - Alert ID
 */
const removeAlert = (id) => {
  return useBoundStore.getState().removeAlert(id)
}

/**
 * 清空所有 Alert
 */
const clearAllAlerts = () => {
  return useBoundStore.getState().clearAllAlerts()
}

/**
 * 显示成功提示
 * @param {string} message - 提示消息
 * @param {number} duration - 自动关闭时间
 * @returns {string} Alert ID
 */
export const success = (message, duration = 3000) => {
  return showAlert(message, 'success', duration)
}

/**
 * 显示错误提示
 * @param {string} message - 提示消息
 * @param {number} duration - 自动关闭时间
 * @returns {string} Alert ID
 */
export const error = (message, duration = 5000) => {
  return showAlert(message, 'error', duration)
}

/**
 * 显示警告提示
 * @param {string} message - 提示消息
 * @param {number} duration - 自动关闭时间
 * @returns {string} Alert ID
 */
export const warning = (message, duration = 4000) => {
  return showAlert(message, 'warning', duration)
}

/**
 * 显示信息提示
 * @param {string} message - 提示消息
 * @param {number} duration - 自动关闭时间
 * @returns {string} Alert ID
 */
export const info = (message, duration = 3000) => {
  return showAlert(message, 'info', duration)
}

/**
 * 导出全局 Alert 对象
 */
export const GlobalAlert = {
  show: showAlert,
  success,
  error,
  warning,
  info,
  remove: removeAlert,
  clearAll: clearAllAlerts,
  AlertType
}

/**
 * 快捷调用方法
 * 提供更简洁的 API
 */
export const alert = {
  success: (message, duration) => success(message, duration),
  error: (message, duration) => error(message, duration),
  warning: (message, duration) => warning(message, duration),
  info: (message, duration) => info(message, duration),
  show: (message, type, duration) => showAlert(message, type, duration),
  clear: () => clearAllAlerts()
}

/**
 * 异步操作包装器
 * 自动显示成功/失败提示
 * @param {Promise} promise - Promise 对象
 * @param {Object} options - 配置项
 * @returns {Promise} 原始 Promise
 */
export const withAlert = (promise, options = {}) => {
  const {
    successMessage = '操作成功',
    errorMessage = '操作失败',
    showSuccess = true,
    showError = true
  } = options

  return promise.then(
    (result) => {
      if (showSuccess) {
        success(successMessage)
      }
      return result
    },
    (error) => {
      if (showError) {
        error(errorMessage + ': ' + (error.message || error))
      }
      throw error
    }
  )
}

/**
 * 创建带 Alert 的异步函数包装器
 * @param {Function} asyncFn - 异步函数
 * @param {Object} options - 配置项
 * @returns {Function} 包装后的函数
 */
export const wrapAsyncWithAlert = (asyncFn, options = {}) => {
  return async (...args) => {
    try {
      const result = await asyncFn(...args)
      if (options.successMessage) {
        success(options.successMessage)
      }
      return result
    } catch (error) {
      if (options.errorMessage) {
        error(options.errorMessage + ': ' + (error.message || error))
      }
      throw error
    }
  }
}