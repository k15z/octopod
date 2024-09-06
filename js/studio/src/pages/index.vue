<template>
    <v-layout class="fill-height">
        <v-navigation-drawer theme="dark" permanent>
            <template v-slot:prepend>
                <v-list-item style="" to="/profile" lines="two" prepend-avatar="https://randomuser.me/api/portraits/men/42.jpg"
                    subtitle="$john.smith@uma.me" title="John Smith"></v-list-item>
            </template>

            <v-divider></v-divider>

            <v-list nav>
                <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/dashboard"></v-list-item>
                <v-list-item prepend-icon="mdi-podcast" title="Podcasts" to="/podcasts"></v-list-item>
                <v-list-item prepend-icon="mdi-cash" title="Payments" to="/payments"></v-list-item>
            </v-list>

            <template v-slot:append>
                <div class="pa-2">
                    <v-btn variant="text" class="spotify-color" @click="logout" block>
                        Logout
                    </v-btn>
                </div>
            </template>
        </v-navigation-drawer>
        <v-main>
            <div class="ml-4 mr-4 mt-2 mb-2">
            <RouterView></RouterView>
        </div>
        </v-main>
    </v-layout>
</template>

<script lang="ts" setup>
import storage from '@/storage';
import { useRouter } from 'vue-router';

const router = useRouter();

function logout() {
    router.push('/auth');
    storage.value.access_token = '';
}
</script>

<style scoped>
::v-deep(.v-list-item--active) {
    background-color: #1DB954;
}
</style>