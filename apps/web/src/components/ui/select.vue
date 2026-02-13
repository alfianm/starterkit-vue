<script setup lang="ts">
import { ref, computed } from 'vue'
import { cn } from '@/lib/utils'
import { ChevronDown, Check } from 'lucide-vue-next'

interface Option {
  value: string
  label: string
}

interface Props {
  modelValue?: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
  error?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

const selectedLabel = computed(() => {
  const option = props.options.find(o => o.value === props.modelValue)
  return option?.label || props.placeholder || 'Select...'
})

const selectOption = (value: string) => {
  emit('update:modelValue', value)
  isOpen.value = false
}
</script>

<template>
  <div class="relative w-full">
    <button
      type="button"
      @click="isOpen = !isOpen"
      :disabled="disabled"
      :class="cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-destructive',
        $attrs.class ?? ''
      )"
    >
      <span :class="!modelValue && 'text-muted-foreground'">{{ selectedLabel }}</span>
      <ChevronDown class="h-4 w-4 opacity-50" />
    </button>
    
    <div
      v-if="isOpen"
      class="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md"
    >
      <div class="max-h-60 overflow-auto p-1">
        <div
          v-for="option in options"
          :key="option.value"
          @click="selectOption(option.value)"
          class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
          :class="modelValue === option.value && 'bg-accent'"
        >
          <Check
            v-if="modelValue === option.value"
            class="mr-2 h-4 w-4"
          />
          <span :class="modelValue === option.value ? 'ml-0' : 'ml-6'">
            {{ option.label }}
          </span>
        </div>
      </div>
    </div>
    
    <p v-if="error" class="mt-1 text-sm text-destructive">{{ error }}</p>
  </div>
</template>
