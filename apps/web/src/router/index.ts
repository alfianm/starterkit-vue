import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { requiresAuth: true, permission: 'users.read' },
      },
      {
        path: 'roles',
        name: 'Roles',
        component: () => import('@/views/Roles.vue'),
        meta: { requiresAuth: true, permission: 'roles.read' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth state if not already done
  if (!authStore.user && authStore.accessToken) {
    await authStore.fetchMe()
  }

  // If route is public, allow access
  if (to.meta.public) {
    // If already logged in and trying to access login, redirect to dashboard
    if (to.path === '/login' && authStore.isAuthenticated) {
      next('/dashboard')
      return
    }
    next()
    return
  }

  // If requires auth and not authenticated, redirect to login
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  // If requires specific permission, check it
  if (to.meta.permission && !authStore.can(to.meta.permission as any)) {
    next('/dashboard')
    return
  }

  next()
})

export default router
