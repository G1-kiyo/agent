/**
 * 认证状态管理 Hook
 */
import { useState, useEffect } from 'react'
import { authApi, isAuthenticated } from "@api/index"
import { useBoundStore } from '@store/index'

export const useAuth = () => {
    // `useBoundStore` state can be typed elsewhere; use `any` here to avoid
    // "Property 'setUser' does not exist on type 'unknown'" when the store
    // type is not inferred.
    const setUser = useBoundStore((state: any) => state.setUser)
    const user = useBoundStore((state: any) => state.user)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    /**
     * 初始化：检查用户登录状态
     */
    useEffect(() => {
        checkAuthStatus().catch((error)=>console.log("Failed to check auth status: ",error))
    }, [])

    /**
     * 检查认证状态
     */
    const checkAuthStatus = async () => {
        if (!isAuthenticated()) {
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const userData = await authApi.getMe()
            setUser(userData)
            setError(null)
        } catch (err) {
            console.error('Failed to fetch user info:', err)
            setUser(null)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    /**
     * 用户登录
     */
    const login = async (username, password) => {
        try {
            setLoading(true)
            setError(null)

            // 调用登录 API
            await authApi.login(username, password)

            // 登录成功后，获取用户信息
            const userData = await authApi.getMe()
            setUser(userData)

            return { success: true }
        } catch (err) {
            console.error('Login failed:', err)
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }

    /**
     * 用户注册
     */
    const register = async (username, email, password) => {
        try {
            setLoading(true)
            setError(null)

            // 调用注册 API
            await authApi.register(username, email, password)

            // 注册成功后，自动登录
            const userData = await authApi.getMe()
            setUser(userData)

            return { success: true }
        } catch (err) {
            console.error('Register failed:', err)
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }

    /**
     * 退出登录
     */
    const logout = () => {
        authApi.logout()
        setUser(null)
        setError(null)
    }

    /**
     * 刷新用户信息
     */
    const refreshUserInfo = async () => {
        try {
            const userData = await authApi.getMe()
            setUser(userData)
            setError(null)
            return { success: true }
        } catch (err) {
            console.error('Failed to refresh user info:', err)
            setError(err.message)
            return { success: false, error: err.message }
        }
    }

    return {
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUserInfo,
    }
}
