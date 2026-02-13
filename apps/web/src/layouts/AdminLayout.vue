<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Button from '@/components/ui/button.vue'
import {
  LayoutDashboard,
  Users,
  Shield,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const isSidebarOpen = ref(true)

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', path: '/users', icon: Users, permission: 'users.read' },
  { name: 'Roles', path: '/roles', icon: Shield, permission: 'roles.read' },
]

const filteredMenuItems = menuItems.filter(item => {
  if (!item.permission) return true
  return authStore.can(item.permission as any)
})

const getBreadcrumbs = () => {
  const crumbs = []
  const currentPath = route.path
  
  if (currentPath !== '/dashboard') {
    crumbs.push({ name: 'Dashboard', path: '/dashboard' })
  }
  
  const currentItem = menuItems.find(item => item.path === currentPath)
  if (currentItem && currentPath !== '/dashboard') {
    crumbs.push({ name: currentItem.name, path: currentItem.path })
  }
  
  return crumbs
}

const handleLogout = async () => {
  await authStore.logout()
  toast.success('Logged out successfully')
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen bg-background">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed left-0 top-0 z-40 h-screen w-64 transform border-r bg-card transition-transform duration-200 lg:static lg:translate-x-0',
        !isSidebarOpen && '-translate-x-full lg:hidden',
      ]"
    >
      <div class="flex h-full flex-col">
        <!-- Logo -->
        <div class="flex h-16 items-center border-b px-6">
          <Shield class="h-6 w-6 text-primary" />
          <span class="ml-2 text-lg font-bold">Admin Kit</span>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 space-y-1 p-4">
          <RouterLink
            v-for="item in filteredMenuItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              route.path === item.path
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            ]"
          >
            <component :is="item.icon" class="mr-3 h-5 w-5" />
            {{ item.name }}
          </RouterLink>
        </nav>

        <!-- User Info -->
        <div class="border-t p-4">
          <div class="mb-3 flex items-center">
            <div class="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              {{ authStore.user?.name.charAt(0).toUpperCase() }}
            </div>
            <div class="ml-3 min-w-0">
              <p class="truncate text-sm font-medium">{{ authStore.user?.name }}</p>
              <p class="truncate text-xs text-muted-foreground">{{ authStore.user?.email }}</p>
            </div>
          </div>
          <Button variant="outline" class="w-full" @click="handleLogout">
            <LogOut class="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="flex h-16 items-center border-b bg-card px-6">
        <Button
          variant="ghost"
          size="icon"
          class="mr-4 lg:hidden"
          @click="isSidebarOpen = !isSidebarOpen"
        >
          <Menu v-if="!isSidebarOpen" class="h-5 w-5" />
          <X v-else class="h-5 w-5" />
        </Button>

        <!-- Breadcrumb -->
        <nav class="flex items-center text-sm text-muted-foreground">
          <template v-for="(crumb, index) in getBreadcrumbs()" :key="crumb.path">
            <RouterLink
              v-if="index < getBreadcrumbs().length - 1"
              :to="crumb.path"
              class="hover:text-foreground"
            >
              {{ crumb.name }}
            </RouterLink>
            <span v-else class="font-medium text-foreground">{{ crumb.name }}</span>
            <ChevronRight
              v-if="index < getBreadcrumbs().length - 1"
              class="mx-2 h-4 w-4"
            />
          </template>
        </nav>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-auto p-6">
        <RouterView />
      </main>
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      @click="isSidebarOpen = false"
    />
  </div>
</template>
