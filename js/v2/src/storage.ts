import {client, userProfile} from '@/api'
import {toReactive, useStorage} from '@vueuse/core'
import {watch} from 'vue'
import { Capacitor } from '@capacitor/core';

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
  let baseUrl = 'https://octopod.kevz.dev/api';
  if (Capacitor.getPlatform() === 'web') {
    baseUrl = 'http://localhost:8000';
  }
  if (storage.access_token) {
    client.setConfig({
      baseUrl: baseUrl,
      headers: {Authorization: `Bearer ${storage.access_token}`}
    })
    checkAccessToken();
  } else {
    client.setConfig({
      baseUrl: baseUrl,
    })
  }
}
watch(() => storage.access_token, () => {setClientConfig()})
setClientConfig()

export default storage;
