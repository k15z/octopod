import {watch} from 'vue'
import {client} from '@/api'
import {toReactive, useStorage} from '@vueuse/core'

const storage = toReactive(useStorage('uma-auth', {
  access_token: '',
}))

function setClientConfig() {
  if (storage.access_token) {
    client.setConfig({
      baseUrl: 'https://octopod.kevz.dev/api',
      headers: {Authorization: `Bearer ${storage.access_token}`}
    })
  } else {
    client.setConfig({
      baseUrl: 'https://octopod.kevz.dev/api',
    })
  }
}
watch(() =>storage.access_token, () => {
  setClientConfig()
})
setClientConfig()

export default storage;
