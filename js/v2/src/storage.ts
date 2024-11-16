import {client, userProfile} from '@/api'
import {toReactive, useStorage} from '@vueuse/core'
import {watch} from 'vue'

const storage = toReactive(useStorage('auth', {
  access_token: '',
}))

async function checkAccessToken() {
  // Try 3 times to get the user profile.
  for (let i = 0; i < 3; i++) {
    let result = await userProfile();
    if (!result.error) {
      return;
    }
  }
  // If we still get an error, clear the access token.
  storage.access_token = '';
}

function setClientConfig() {
  if (storage.access_token) {
    client.setConfig({
      baseUrl: 'https://octopod.kevz.dev/api',
      headers: {Authorization: `Bearer ${storage.access_token}`}
    })
    checkAccessToken();
  } else {
    client.setConfig({
      baseUrl: 'https://octopod.kevz.dev/api',
    })
  }
}
watch(() => storage.access_token, () => {setClientConfig()})
setClientConfig()

export default storage;
