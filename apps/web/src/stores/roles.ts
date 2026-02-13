import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/utils/api'
import type { 
  Role, 
  CreateRoleRequest, 
  UpdateRoleRequest,
  Permission,
  ApiResponse 
} from '@starter/shared'

export const useRolesStore = defineStore('roles', () => {
  // State
  const roles = ref<Role[]>([])
  const permissions = ref<Permission[]>([])
  const isLoading = ref(false)

  // Actions
  const fetchRoles = async () => {
    isLoading.value = true
    try {
      const response = await api.get<ApiResponse<Role[]>>('/roles')
      roles.value = response.data.data
    } finally {
      isLoading.value = false
    }
  }

  const fetchPermissions = async () => {
    const response = await api.get<ApiResponse<Permission[]>>('/permissions')
    permissions.value = response.data.data
  }

  const createRole = async (data: CreateRoleRequest): Promise<Role | null> => {
    const response = await api.post<ApiResponse<Role>>('/roles', data)
    return response.data.data
  }

  const updateRole = async (id: string, data: UpdateRoleRequest): Promise<Role | null> => {
    const response = await api.put<ApiResponse<Role>>(`/roles/${id}`, data)
    return response.data.data
  }

  const deleteRole = async (id: string): Promise<boolean> => {
    await api.delete<ApiResponse<null>>(`/roles/${id}`)
    return true
  }

  return {
    roles,
    permissions,
    isLoading,
    fetchRoles,
    fetchPermissions,
    createRole,
    updateRole,
    deleteRole,
  }
})
