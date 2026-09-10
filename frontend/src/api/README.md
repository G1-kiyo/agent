# API 目录说明

## 📁 目录结构

```
src/api/
├── index.js        # 统一导出
├── request.js      # 统一请求封装
├── auth.js         # 认证相关 API
└── ...             # 其他业务 API（待添加）
```

## 📦 文件说明

### 1. request.js - 统一请求封装

包含所有请求相关的通用功能：
- 请求封装函数 `apiRequest`
- Token 管理（获取、设置、清除、刷新）
- 成功/失败处理
- 自动处理 Loading 和 Alert
- 自动刷新过期 Token

**主要导出：**
```javascript
export {
  request,           // 请求函数
  getAccessToken,    // 获取 token
  setAccessToken,    // 设置 token
  clearAccessToken,  // 清除 token
  refreshAccessToken,// 刷新 token
  isAuthenticated    // 检查登录状态
}
```

**使用方式：**
```javascript
import { request } from '@/api'

// 基本请求
const data = await request('/endpoint', options, config)

// 完整配置
const response = await request('/user/profile', {
  method: 'GET'
}, {
  needLoading: true,    // 显示 loading
  needAlert: true,      // 显示 alert
  needOrigin: false     // 返回原始响应
})
```

**配置项：**
- `needLoading` (boolean): 是否显示 Loading，默认 `true`
- `needAlert` (boolean): 是否显示 Alert，默认 `true`
- `needOrigin` (boolean): 是否返回原始响应，默认 `false`

---

### 2. auth.js - 认证相关 API

包含所有认证相关的业务 API：
- 用户登录
- 用户注册
- 获取用户信息
- 退出登录
- 刷新 Token

**主要导出：**
```javascript
export const authApi = {
  login,
  register,
  getMe,
  logout,
  refreshToken
}
```

**使用方式：**
```javascript
import { authApi } from '@/api'

// 登录
const result = await authApi.login(username, password)

// 注册
const result = await authApi.register(username, email, password)

// 获取用户信息
const user = await authApi.getMe()

// 退出登录
authApi.logout()

// 刷新 token
const newToken = await authApi.refreshToken()
```

---

### 3. index.js - 统一导出

提供统一的导入入口：

```javascript
// 推荐用法 1：按需导入
import { request, authApi } from '@/api'

// 推荐用法 2：全部导入
import * as api from '@/api'
await api.authApi.login(username, password)
```

---

## 🚀 使用示例

### 基础请求

```javascript
import { request } from '@/api'

// GET 请求
const users = await request('/users', {
  method: 'GET'
})

// POST 请求
const result = await request('/users', {
  method: 'POST',
  body: JSON.stringify({ name: 'John' })
})

// 自定义配置
const data = await request('/endpoint', options, {
  needLoading: false,   // 不显示 loading
  needAlert: false,     // 不显示 alert
  needOrigin: true      // 返回原始响应
})
```

### 认证相关

```javascript
import { authApi, isAuthenticated } from '@/api'

// 检查登录状态
if (isAuthenticated()) {
  // 已登录
}

// 登录
try {
  const result = await authApi.login('username', 'password')
  console.log('登录成功', result)
} catch (error) {
  console.error('登录失败', error.message)
}

// 注册
const result = await authApi.register('username', 'email@example.com', 'password')

// 获取用户信息
const user = await authApi.getMe()

// 退出登录
authApi.logout()
```

### Token 管理

```javascript
import { 
  getAccessToken, 
  setAccessToken, 
  clearAccessToken,
  refreshAccessToken 
} from '@/api'

// 获取 token
const token = getAccessToken()

// 设置 token
setAccessToken('new-token')

// 清除 token
clearAccessToken()

// 刷新 token
const newToken = await refreshAccessToken()
```

---

## 📝 扩展业务 API

当需要添加新的业务 API 时，创建对应的文件：

### 示例：创建用户管理 API

**1. 创建 `src/api/user.js`**

```javascript
import request from './request'

export const userApi = {
  /**
   * 获取用户列表
   */
  getList: async (params) => {
    const response = await request('/users', {
      method: 'GET',
      body: JSON.stringify(params)
    })
    return response
  },

  /**
   * 获取用户详情
   */
  getDetail: async (userId) => {
    const response = await request(`/users/${userId}`)
    return response
  },

  /**
   * 创建用户
   */
  create: async (userData) => {
    const response = await request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
    return response
  },

  /**
   * 更新用户
   */
  update: async (userId, userData) => {
    const response = await request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    })
    return response
  },

  /**
   * 删除用户
   */
  delete: async (userId) => {
    const response = await request(`/users/${userId}`, {
      method: 'DELETE'
    })
    return response
  }
}

export default userApi
```

**2. 在 `src/api/index.js` 中导出**

```javascript
export { default as authApi } from './auth'
export { default as userApi } from './user'
export * from './user'
```

**3. 使用新的 API**

```javascript
import { userApi } from '@/api'

// 获取用户列表
const users = await userApi.getList({ page: 1, limit: 10 })

// 获取用户详情
const user = await userApi.getDetail(userId)

// 创建用户
const result = await userApi.create({ name: 'John', email: 'john@example.com' })
```

---

## ⚠️ 注意事项

1. **推荐用法**：所有代码都应该从 `@/api` 导入
2. **Token 自动管理**：请求会自动添加 token，token 过期会自动刷新
3. **Loading/Alert**：默认显示 loading 和 alert，可通过配置关闭
4. **错误处理**：统一错误处理，业务失败会自动显示错误提示