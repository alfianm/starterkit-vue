<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Button from '@/components/ui/button.vue'
import Input from '@/components/ui/input.vue'
import Label from '@/components/ui/label.vue'
import Card from '@/components/ui/card.vue'
import CardHeader from '@/components/ui/card-header.vue'
import CardTitle from '@/components/ui/card-title.vue'
import CardDescription from '@/components/ui/card-description.vue'
import CardContent from '@/components/ui/card-content.vue'
import { Shield, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const errors = ref<Record<string, string>>({})
const isLoading = ref(false)

const validate = () => {
  errors.value = {}
  
  if (!email.value) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Invalid email format'
  }
  
  if (!password.value) {
    errors.value.password = 'Password is required'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return
  
  isLoading.value = true
  
  const success = await authStore.login({
    email: email.value,
    password: password.value,
  })
  
  isLoading.value = false
  
  if (success) {
    toast.success('Login successful!')
    router.push('/dashboard')
  } else {
    toast.error('Invalid email or password')
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <div class="mb-4 flex justify-center">
          <div class="rounded-full bg-primary p-3">
            <Shield class="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <CardTitle class="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              type="email"
              placeholder="admin@example.com"
              :error="errors.email"
            />
          </div>
          
          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="••••••••"
              :error="errors.password"
            />
          </div>
          
          <Button
            type="submit"
            class="w-full"
            :disabled="isLoading"
          >
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            Sign In
          </Button>
        </form>
        
        <div class="mt-6 rounded-lg border bg-muted p-4 text-sm">
          <p class="font-medium mb-2">Demo Credentials:</p>
          <p class="text-muted-foreground">Email: admin@example.com</p>
          <p class="text-muted-foreground">Password: Admin123!</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
