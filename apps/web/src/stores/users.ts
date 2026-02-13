import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/utils/api'
import type { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest,
  UserFilterParams,
  ApiResponse 
} from '@starter/shared'

export interface UsersState {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
  isLoading: boolean
}

export const useUsersStore = defineStore('users', () => {
  // State
  const users = ref<User[]>([])
  const total = ref(0)
  const page = ref(1)
  const limit = ref(10)
  const totalPages = ref(0)
  const isLoading = ref(false)

  // Actions
  const fetchUsers = async (params?: UserFilterParams) => {
    isLoading.value = true
    try {
      const response = await api.get<ApiResponse<User[]>>('/users', {
        params: {
          page: params?.page || page.value,
          limit: params?.limit || limit.value,
          search: params?.search,
          roleId: params?.roleId,
          status: params?.status,
        },
      })
      
      users.value = response.data.data
      if (response.data.meta) {
        total.value = response.data.meta.total || 0
        page.value = response.data.meta.page || 1
        limit.value = response.data.meta.limit || 10
        totalPages.value = response.data.meta.totalPages || 0
      }
    } finally {
      isLoading.value = false
    }
  }

  const createUser = async (data: CreateUserRequest): Promise<User | null> => {
    const response = await api.post<ApiResponse<User>>('/users', data)
    return response.data.data
  }

  const updateUser = async (id: string, data: UpdateUserRequest): Promise<User | null> => {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data)
    return response.data.data
  }

  const deleteUser = async (id: string): Promise<boolean> => {
    await api.delete<ApiResponse<null>>(`/users/${id}`)
    return true
  }

  const assignRole = async (userId: string, roleId: string): Promise<User | null> => {
    const response = await api.put<ApiResponse<User>>(`/users/${userId}/role`, { roleId })
    return response.data.data
  }

  return {
    users,
    total,
    page,
    limit,
    totalPages,
    isLoading,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    assignRole,
  }
})
