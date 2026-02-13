import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/utils/api'
import type { 
  User, 
  AuthResponse, 
  LoginRequest, 
  Permission,
  ApiResponse 
} from '@starter/shared'
import { Permissions } from '@starter/shared'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const permissions = computed(() => user.value?.role?.permissions || [])
  
  const can = (permission: Permission): boolean => {
    return permissions.value.includes(permission)
  }

  // Actions
  const setAuth = (data: AuthResponse) => {
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    user.value = data.user
    
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    api.defaults.headers.Authorization = `Bearer ${data.accessToken}`
  }

  const clearAuth = () => {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    delete api.defaults.headers.Authorization
  }

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    isLoading.value = true
    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
      setAuth(response.data.data)
      return true
    } catch (error) {
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = async () => {
    if (refreshToken.value) {
      try {
        await api.post('/auth/logout', { refreshToken: refreshToken.value })
      } catch (error) {
        // Ignore error
      }
    }
    clearAuth()
  }

  const fetchMe = async (): Promise<boolean> => {
    if (!accessToken.value) return false
    
    try {
      api.defaults.headers.Authorization = `Bearer ${accessToken.value}`
      const response = await api.get<ApiResponse<{ user: User }>>('/auth/me')
      user.value = response.data.data.user
      return true
    } catch (error) {
      clearAuth()
      return false
    }
  }

  const init = async () => {
    if (accessToken.value) {
      await fetchMe()
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    isAuthenticated,
    permissions,
    can,
    login,
    logout,
    fetchMe,
    init,
    setAuth,
    clearAuth,
  }
})
