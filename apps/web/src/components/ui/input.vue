<script setup lang="ts">
import { cn } from '@/lib/utils'

interface Props {
  modelValue?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="w-full">
    <input
      :type="type"
      :value="modelValue"
      @input="handleInput"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive focus-visible:ring-destructive',
        $attrs.class ?? ''
      )"
    />
    <p v-if="error" class="mt-1 text-sm text-destructive">{{ error }}</p>
  </div>
</template>
