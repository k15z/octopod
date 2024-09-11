<template>
    <v-layout class="fill-height">
        <v-navigation-drawer theme="dark" permanent>
            <template v-slot:prepend>
                <template v-if="profile">
                    <v-list-item style="" to="/profile" lines="two"
                        prepend-avatar="https://randomuser.me/api/portraits/men/42.jpg" :subtitle="profile.uma_address"
                        :title="profile.name"></v-list-item>
                </template>
                <template v-else>
                    <v-list-item style="" to="/profile" lines="two"
                        subtitle="..."
                        title="..."></v-list-item>
                </template>
            </template>

            <v-divider></v-divider>

            <v-list nav>
                <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/dashboard"></v-list-item>
                <v-list-item prepend-icon="mdi-podcast" title="Podcasts" to="/podcasts"></v-list-item>
                <v-list-item prepend-icon="mdi-content-cut" title="Podclips" to="/podclips"></v-list-item>
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
import { ref } from 'vue';
import storage from '@/storage';
import { useRouter } from 'vue-router';
import { CreatorService, CreatorProfile } from '@/api';

const router = useRouter();
const profile = ref<CreatorProfile | null>(null);

CreatorService.creatorProfile().then((data) => {
    profile.value = data;
});

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