import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Initialize auth state before mounting
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()
authStore.init().then(() => {
  app.mount('#app')
})
