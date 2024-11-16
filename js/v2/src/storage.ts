import { useStorage, toReactive } from '@vueuse/core'

const storage = toReactive(useStorage('uma-auth', {
    access_token: '',
}))

export default storage;