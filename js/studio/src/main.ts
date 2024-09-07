import {OpenAPI} from '@/api';
import {registerPlugins} from '@/plugins'
import storage from '@/storage';

// Composables
import {createApp, watch} from 'vue'

// Components
import App from './App.vue'

if (!import.meta.env.PROD) {
  OpenAPI.BASE = 'http://localhost:8000'
} else {
  OpenAPI.BASE = '/api'
}

// Keep the token in sync with the storage
OpenAPI.TOKEN = storage.value.access_token
watch(() => storage.value.access_token, () => {
  OpenAPI.TOKEN = storage.value.access_token
})

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
