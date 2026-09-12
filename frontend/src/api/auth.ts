import request from './request'

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 用户登录
   * @param {string} username - 用户名/邮箱
   * @param {string} password - 密码
   * @returns {Promise} 登录结果
   */
  login: async (username: string, password: string): Promise<any> => {
    const response = await request.request('/user/login', {
      method: 'POST',
      body: JSON.stringify({ account: username, password }),
      headers: { "Content-Type": "application/json" }
    })

    request.setAccessToken(response.access_token)
    return response
  },

  /**
   * 用户注册
   * @param {string} username - 用户名
   * @param {string} email - 邮箱
   * @param {string} password - 密码
   * @returns {Promise} 注册结果
   */
  register: async (username: string, email: string, password: string): Promise<any> => {
    const response = await request.request('/user/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
      headers: { "Content-Type": "application/json" }
    })

    return response
  },

  /**
   * 获取当前用户信息
   * @returns {Promise} 用户信息
   */
  getMe: async (): Promise<any> => {
    const response = await request.request(`/user/me`, {}, { needLoading: false })
    return response
  },

  /**
   * 退出登录
   */
  logout: () => {
    request.clearAccessToken()
    // 清除所有认证相关的 cookie
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  },

  /**
   * 刷新 token
   * @returns {Promise} 新的 token
   */
  refreshToken: async (): Promise<any> => {
    return await request.refreshAccessToken()
  },
}

export default authApi