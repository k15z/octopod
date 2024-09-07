import {useStorage} from '@vueuse/core'

// bind object
const state = useStorage('studio-store', {
    access_token: '',
})

export default state