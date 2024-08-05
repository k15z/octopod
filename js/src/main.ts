/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'

// API
import { OpenAPI } from './api'

OpenAPI.BASE = "http://localhost:8000"

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
