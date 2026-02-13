import { h, render } from 'vue'
import Toast from '@/components/ui/toast.vue'
import type { ToastOptions } from '@/components/ui/toast.vue'

export const useToast = () => {
  const show = (options: ToastOptions) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    const vnode = h(Toast, {
      ...options,
    })

    render(vnode, container)

    // Cleanup after animation
    setTimeout(() => {
      render(null, container)
      document.body.removeChild(container)
    }, options.duration || 3000 + 500)
  }

  const success = (message: string, duration?: number) => {
    show({ message, type: 'success', duration })
  }

  const error = (message: string, duration?: number) => {
    show({ message, type: 'error', duration })
  }

  const info = (message: string, duration?: number) => {
    show({ message, type: 'info', duration })
  }

  return {
    show,
    success,
    error,
    info,
  }
}
