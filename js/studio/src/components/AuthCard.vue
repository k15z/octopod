<template>
    <v-card color="white" class="pa-6">
        <v-card-item>
            <v-card-title>
                <div class="text-h4 font-weight-bold mb-n1">Studio</div>
            </v-card-title>
            <v-card-subtitle>
                <div class="text-subtitle-1 font-weight-bold mb-n1 spotify-color">Project Octopod</div>
            </v-card-subtitle>
        </v-card-item>

        <template v-if="view === View.Login">
            <v-card-text class="pt-4">
                <v-text-field variant="underlined" label="Email" type="email" v-model="data.email"></v-text-field>
                <v-text-field variant="underlined" label="Password" type="password"
                    v-model="data.password"></v-text-field>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn @click="login" class="spotify-color">Login</v-btn>
            </v-card-actions>
            <div class="text-center text-body-2">
                <a class="link text-grey-darken-2" @click="view = View.Signup">Don't have an account?</a>
            </div>
        </template>

        <template v-else>
            <v-card-text class="pt-4">
                <v-text-field variant="underlined" label="Email" type="email" v-model="data.email"></v-text-field>
                <v-text-field variant="underlined" label="Password" type="password"
                    v-model="data.password"></v-text-field>
                <v-text-field variant="underlined" label="Account Name" v-model="data.name"></v-text-field>
                <v-text-field variant="underlined" label="UMA Address" v-model="data.uma_address"></v-text-field>
            </v-card-text>
            <v-card-actions class="d-flex justify-end">
                <v-btn @click="signup" class="spotify-color">Sign Up</v-btn>
            </v-card-actions>
            <div class="text-center text-body-2">
                <a class="link text-grey-darken-2" @click="view = View.Login">Already have an account?</a>
            </div>
        </template>
    </v-card>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { CreatorService } from '@/api';
import storage from '@/storage';

enum View {
    Login = 1,
    Signup,
}
const view = ref<View>(View.Login)

const data = reactive({
    email: '',
    password: '',
    name: '',
    uma_address: '',
})

const router = useRouter()

function login() {
    CreatorService.creatorToken({
        'username': data.email,
        'password': data.password,
    }
    ).then((token_data) => {
        storage.value.access_token = token_data.access_token;
        router.push('/dashboard');
    }).catch((err) => {
        alert(err)
    })
}

function signup() {
    CreatorService.creatorRegister({
        'email': data.email,
        'name': data.name,
        'uma_address': data.uma_address,
    }).then((token_data) => {
        storage.value.access_token = token_data.access_token;
        router.push('/dashboard');
    }).catch((err) => {
        alert(err)
    })
}

</script>

<style scoped>
.link {
    cursor: pointer;
}

.link:hover {
    color: black !important;
}
</style>