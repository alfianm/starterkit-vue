<script setup lang="ts">
import { ref, watch } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  open?: boolean
  title?: string
  description?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = ref(props.open)

watch(() => props.open, (val) => {
  isOpen.value = val
})

watch(isOpen, (val) => {
  emit('update:open', val)
})

const close = () => {
  isOpen.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 bg-black/80"
        @click="close"
      />
    </Transition>
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]"
      >
        <div class="rounded-lg border bg-background p-6 shadow-lg">
          <div v-if="title || description" class="mb-4">
            <h3 v-if="title" class="text-lg font-semibold">{{ title }}</h3>
            <p v-if="description" class="text-sm text-muted-foreground">{{ description }}</p>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
