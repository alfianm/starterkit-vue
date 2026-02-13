<script setup lang="ts">
import { onMounted } from 'vue'
import { useStatsStore } from '@/stores/stats'
import Card from '@/components/ui/card.vue'
import CardHeader from '@/components/ui/card-header.vue'
import CardTitle from '@/components/ui/card-title.vue'
import CardDescription from '@/components/ui/card-description.vue'
import CardContent from '@/components/ui/card-content.vue'
import Badge from '@/components/ui/badge.vue'
import { Users, Shield, UserCheck, Activity } from 'lucide-vue-next'
import { formatDateTime } from '@/lib/utils'

const statsStore = useStatsStore()

onMounted(() => {
  statsStore.fetchStats()
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-3xl font-bold">Dashboard</h1>
    
    <!-- KPI Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Total Users</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ statsStore.stats?.usersCount || 0 }}
          </div>
          <p class="text-xs text-muted-foreground">Registered users</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Total Roles</CardTitle>
          <Shield class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ statsStore.stats?.rolesCount || 0 }}
          </div>
          <p class="text-xs text-muted-foreground">Defined roles</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Active Users</CardTitle>
          <UserCheck class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ statsStore.stats?.activeUsersCount || 0 }}
          </div>
          <p class="text-xs text-muted-foreground">
            {{ statsStore.stats ? 
              Math.round((statsStore.stats.activeUsersCount / statsStore.stats.usersCount) * 100) : 0 
            }}% of total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Recent Activity</CardTitle>
          <Activity class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ statsStore.stats?.recentActivities?.length || 0 }}
          </div>
          <p class="text-xs text-muted-foreground">In the last 24h</p>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Activity -->
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div v-if="statsStore.isLoading" class="py-8 text-center text-muted-foreground">
          Loading...
        </div>
        <div v-else-if="!statsStore.stats?.recentActivities?.length" class="py-8 text-center text-muted-foreground">
          No recent activity
        </div>
        <div v-else class="space-y-4">
          <div
            v-for="activity in statsStore.stats.recentActivities"
            :key="activity.id"
            class="flex items-center justify-between rounded-lg border p-4"
          >
            <div class="flex items-center gap-4">
              <div class="rounded-full bg-primary/10 p-2">
                <Activity class="h-4 w-4 text-primary" />
              </div>
              <div>
                <p class="font-medium">{{ activity.action }}</p>
                <p class="text-sm text-muted-foreground">{{ activity.details }}</p>
              </div>
            </div>
            <div class="text-right">
              <Badge variant="secondary">{{ activity.user }}</Badge>
              <p class="mt-1 text-xs text-muted-foreground">
                {{ formatDateTime(activity.timestamp) }}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
