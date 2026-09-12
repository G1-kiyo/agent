import { GlobalAlert, GlobalLoading } from '../components'
import { BUSINESS_SUCCESS, AUTHORIZATIN_FAILURE } from '../consts'

/**
 * API 请求封装
 * 自动处理 token 认证和刷新
 */

const API_BASE_URL = 'http://localhost:3000/api/v1'
export const DATA_TYPE = {
    "JSON": "json",
    "STREAM": "stream"
}

/**
 * 从 localStorage 获取 access_token
 */
const getAccessToken = () => {
    return localStorage.getItem('access_token')
}

/**
 * 保存 access_token 到 localStorage
 */
const setAccessToken = (token) => {
    localStorage.setItem('access_token', token)
}

/**
 * 清除 access_token
 */
const clearAccessToken = () => {
    localStorage.removeItem('access_token')
}

/**
 * 刷新 access_token
 */
const refreshAccessToken = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/refresh`, {
            method: 'POST',
            credentials: 'include', // 包含 cookie
        })

        if (!response.ok) {
            throw new Error('Token refresh failed')
        }

        const { code, data, msg } = await response.json()
        if (code === BUSINESS_SUCCESS) {
            setAccessToken(data?.access_token)
            return data.access_token
        } else {
            throw new Error(msg || "Refresh access token failed")
        }

    } catch (error) {
        console.error('Failed to refresh token:', error)
        clearAccessToken()
        throw error
    }
}
// 请求key和对应controllerMap
export const requestMap = new Map()
// 中断请求
const removeRequestFromMap = (key) => {
    if (requestMap.has(key)) {
        const controller = requestMap.get(key)
        controller.abort()
        requestMap.delete(key)
    }
}
export const cancelRequest = (config) => {
    // 拼接请求url、请求方法、当前时间
    const key = `${config.url}_${config.method}_${Date.now()}`
    removeRequestFromMap(key)
    const newController = new AbortController()
    requestMap.set(key, newController)
    config.signal = newController.signal

    return () => {
        removeRequestFromMap(key)
    }
}
// 鉴权重试
const reGenerateRquestToken = async (payload) => {
    const { requestOptions, token } = payload
    try {
        const newToken = await refreshAccessToken()
        const headers = requestOptions.headers || {}
        headers['Authorization'] = `Bearer ${newToken}`
        requestOptions.headers = headers
        return [requestOptions, token]
    } catch (error) {
        throw new Error(error.message)
    }
}
/**
 * jsonresponse成功处理函数
 * @param {Object} res - 响应数据
 * @param {Object} config - 配置项
 * @param {Object} payload - 载荷数据
 */
const jsonSuccessHandler = async (res, config, payload) => {
    const { token } = payload
    const { code, data, msg } = res
    const { needOrigin } = config

    if (code !== BUSINESS_SUCCESS) {
        console.log("code", code,token)
        // 如果 token 过期，尝试刷新并重试
        if (code === AUTHORIZATIN_FAILURE && token) {

            try {
                const [newRequestOptions, newToken] = await reGenerateRquestToken(payload)
                const response = await fetch(newRequestOptions.url, newRequestOptions)
                const jsonData = await response.json()

                // 递归调用处理新的响应
                return await jsonSuccessHandler(jsonData, config, { requestOptions: newRequestOptions, token: newToken })
            } catch (error) {
                throw new Error(msg || error.message)
            }
        }
        throw new Error(msg || 'Request failed')
    }

    if (needOrigin) return res
    return data
}
/**
 * streamresponse成功处理函数
 * @param {Object} res - 响应数据
 * @param {Object} config - 配置项
 * @param {Object} payload - 载荷数据
 */
const streamSuccessHandler = async (res, config, payload) => {
    const { token } = payload
    const { status, statusText } = res
    const { needAlert } = config

    if (status === AUTHORIZATIN_FAILURE && token) {
        if (needAlert) {
            GlobalAlert.error(statusText || "Request failed, please try again")
        }
        try {
            const [newRequestOptions, newToken] = await reGenerateRquestToken(payload)
            const response = await fetch(newRequestOptions.url, newRequestOptions)

            // 递归调用处理新的响应
            return await streamSuccessHandler(response, config, { requestOptions: newRequestOptions, token: newToken })
        } catch (error) {
            throw new Error(statusText || error.message)
        }
    }
    return res
}

/**
 * 失败处理函数
 * @param {Error} error - 错误对象
 * @param {Object} config - 配置项
 */
const failureHandler = (error, config) => {
    const { needAlert } = config
    const errorMsg = error?.message || "Request failed, please try again"
    console.log(111, errorMsg)
    if (needAlert) {
        console.log("alert")
        GlobalAlert.error(errorMsg)
    }

    throw new Error(errorMsg)
}

/**
 * 统一的 API 请求函数
 * 自动添加 token，处理 token 过期自动刷新
 * @param {string} endpoint - API 端点
 * @param {Object} options - fetch 选项
 * @param {Object} config - 配置项
 * @param {boolean} [config.needLoading] - 是否显示 loading
 * @param {boolean} [config.needAlert] - 是否显示 alert
 * @param {boolean} [config.needOrigin] - 是否返回原始响应
 * @param {string} [config.dataType] - 返回数据类型
 * @returns {Promise} 请求结果
 */
type ApiRequestOptions = RequestInit & {
    headers?: Record<string, string>
}

const apiRequest = async (endpoint: string, options: ApiRequestOptions = {}, config: { needLoading?: boolean; needAlert?: boolean; needOrigin?: boolean; dataType?: string } = {}): Promise<any> => {
    const finalConfig = {
        needLoading: true,
        needAlert: true,
        needOrigin: false,
        dataType: DATA_TYPE.JSON,
        ...config

    }
    const url = `${API_BASE_URL}${endpoint}`

    // 添加 Authorization header
    const headers: Record<string, string> = {
        ...(options.headers ?? {}),
    }

    const token = getAccessToken()
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const requestOptions: ApiRequestOptions & { url?: string } = {
        ...options,
        headers,
        credentials: 'include', // 包含 cookie（用于 refresh_token）
        url // 保存 URL 用于重试
    }
    const { needLoading, dataType } = finalConfig;
    if (needLoading) {
        GlobalLoading.show('Loading...')
    }

    try {
        const response = await fetch(url, requestOptions)

        if (dataType === DATA_TYPE.JSON) {
            const jsonData = await response.json()
            return await jsonSuccessHandler(jsonData, finalConfig, { requestOptions, token })
        } else if (dataType === DATA_TYPE.STREAM) {
            return await streamSuccessHandler(response, finalConfig, { requestOptions, token })
        }
        failureHandler(new Error("Unknown Data Type"), finalConfig)

    } catch (error) {
        failureHandler(error, finalConfig)
    } finally {
        GlobalLoading.hide()
    }
}

/**
 * 检查用户是否已登录
 */
export const isAuthenticated = () => {
    return !!getAccessToken()
}

/**
 * 导出 API 相关函数（具名导出）
 */
export {
    apiRequest as request,
    getAccessToken,
    setAccessToken,
    clearAccessToken,
    refreshAccessToken
}

/**
 * 默认导出 API 对象（向后兼容）
 */
export default {
    request: apiRequest,
    getAccessToken,
    setAccessToken,
    clearAccessToken,
    refreshAccessToken,
    isAuthenticated
}