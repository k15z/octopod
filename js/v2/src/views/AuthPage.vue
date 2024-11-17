<template>
    <ion-page>
        <div style="height:100%; display: flex; align-items: center; justify-content: center;" class="gradient">
            <ion-card color="dark" style="width: 100%; max-width: 400px;">
                <ion-card-header>
                    <ion-card-title>
                        <ion-text color="light">
                            <h1 style="font-size: 2rem; font-weight: 700; margin: 0;">Octopod</h1>
                        </ion-text>
                    </ion-card-title>
                    <ion-card-subtitle>
                        <ion-text color="medium">
                            Podcasts, reimagined.
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
                            <ion-button color="light" expand="block" @click="register">Register</ion-button>
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
import { ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonInput, IonText, IonInputPasswordToggle } from '@ionic/vue';
import { userToken } from "@/api"
import storage from "@/storage"
import { userRegister, userProfile } from '@/api';

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
        await nextTick();
        const profileRes = await userProfile();
        if (profileRes.data) {
            if (profileRes.data.first_name && profileRes.data.last_name) {
                router.push('/app/home');
            } else {
                router.push('/create');
            }
        } else {
            alert('Something went wrong');
        }
    } else {
        alert('Incorrect email or password');
    }
};

const register = async () => {
    const res = await userRegister({
        body: {
            email: data.value.email, password: data.value.password,
            nwc_string: '',
            first_name: '',
            last_name: '',
            picture_url: null,
            nwc_refresh_token: null,
            nwc_expires_at: null,
            access_token_expires_at: null
        }
    });
    if (res.data) {
        storage.access_token = res.data.access_token;
        router.push('/create');
    } else {
        alert('Something went wrong');
    }
};
</script>
