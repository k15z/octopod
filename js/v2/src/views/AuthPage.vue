<template>
    <ion-page>
        <div style="height:100%; display: flex; align-items: center;" class="gradient">
            <ion-card color="dark" style="width: 100%;">
                <ion-card-header>
                    <ion-card-title>
                        <ion-text color="light">
                            <h1 style="font-size: 2rem; font-weight: 700; margin: 0;">Octopod</h1>
                        </ion-text>
                    </ion-card-title>
                    <ion-card-subtitle>
                        <ion-text color="medium">
                            Podcasting, reimagined.
                        </ion-text>
                    </ion-card-subtitle>
                </ion-card-header>

                <ion-card-content>
                    <template v-if="view === 'login'">
                        <div style="padding: 0 0.5rem;">
                            <ion-input label="Email" v-model="data.email" label-placement="stacked"
                                placeholder="you@octopod.fm" />
                            <ion-input label="Password" v-model="data.password" label-placement="stacked"
                                placeholder="••••••••••••••••" type="password">
                                <ion-input-password-toggle color="light" slot="end"></ion-input-password-toggle>
                            </ion-input>
                            <br />
                            <ion-button color="light" expand="block" @click="login">Login</ion-button>
                            <br />
                            <div style="text-align: center; margin-top: 2rem;">
                                <ion-text color="medium">
                                    <p style="margin: 0;">
                                        <a @click="toggleView"
                                            style="color: var(--ion-color-primary); text-decoration: none;">
                                            Don't have an account?
                                        </a>
                                    </p>
                                </ion-text>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div style="padding: 0 0.5rem;">
                            <ion-input label="Email" v-model="data.email" label-placement="stacked"
                                placeholder="you@octopod.fm" />
                            <ion-input label="Password" v-model="data.password" label-placement="stacked"
                                placeholder="••••••••••••••••" type="password">
                                <ion-input-password-toggle color="light" slot="end"></ion-input-password-toggle>
                            </ion-input>
                            <ion-input label="Confirm Password" v-model="data.confirmPassword" label-placement="stacked"
                                placeholder="••••••••••••••••" type="password">
                                <ion-input-password-toggle color="light" slot="end"></ion-input-password-toggle>
                            </ion-input>
                            <br />
                            <ion-button color="light" expand="block">Register</ion-button>
                            <br />
                            <div style="text-align: center; margin-top: 2rem;">
                                <ion-text color="medium">
                                    <p style="margin: 0;">
                                        <a @click="toggleView"
                                            style="color: var(--ion-color-primary); text-decoration: none;">
                                            Already have an account?
                                        </a>
                                    </p>
                                </ion-text>
                            </div>
                        </div>
                    </template>
                </ion-card-content>
            </ion-card>
        </div>
    </ion-page>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonInput, IonText, IonInputPasswordToggle } from '@ionic/vue';
import { userToken } from "@/api"
import storage from "@/storage"

const router = useRouter();
const view = ref('login');
const data = ref({
    email: '',
    password: '',
    confirmPassword: ''
})

const toggleView = () => {
    view.value = view.value === 'login' ? 'signup' : 'login';
};

const login = async () => {
    const res = await userToken({ body: { username: data.value.email, password: data.value.password } });
    if (res.data) {
        storage.access_token = res.data.access_token;
        router.push('/app/home');
    } else {
        alert('Invalid credentials');
    }
};
</script>

<style scoped>
.gradient {
    background-image: linear-gradient(135deg, rgb(106, 205, 99), rgb(78, 103, 205)), linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
}
</style>
