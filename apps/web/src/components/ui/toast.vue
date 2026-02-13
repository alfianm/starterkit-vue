<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-vue-next'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastOptions {
  message: string
  type?: ToastType
  duration?: number
}

const props = withDefaults(defineProps<ToastOptions>(), {
  type: 'info',
  duration: 3000,
})

const isVisible = ref(false)

onMounted(() => {
  isVisible.value = true
  setTimeout(() => {
    isVisible.value = false
  }, props.duration)
})

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const colors = {
  success: 'bg-green-500',
  error: 'bg-destructive',
  info: 'bg-blue-500',
}

const Icon = icons[props.type]
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="isVisible"
        :class="cn(
          'fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-md px-4 py-3 text-white shadow-lg',
          colors[type]
        )"
      >
        <Icon class="h-5 w-5" />
        <span class="text-sm font-medium">{{ message }}</span>
        <button
          @click="isVisible = false"
          class="ml-2 rounded-full p-1 hover:bg-white/20"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </Transition>
  </Teleport>
</template>
