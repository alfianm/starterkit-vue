import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/utils/api'
import type { Stats, ApiResponse } from '@starter/shared'

export const useStatsStore = defineStore('stats', () => {
  // State
  const stats = ref<Stats | null>(null)
  const isLoading = ref(false)

  // Actions
  const fetchStats = async () => {
    isLoading.value = true
    try {
      const response = await api.get<ApiResponse<Stats>>('/stats')
      stats.value = response.data.data
    } finally {
      isLoading.value = false
    }
  }

  return {
    stats,
    isLoading,
    fetchStats,
  }
})
