<template>
    <ion-page>
        <div class="header" v-if="!miniplayer">
            <ion-icon @click="goToProfile" :icon="personCircleOutline" size="large"></ion-icon>
        </div>
        <ion-router-outlet id="main-content"></ion-router-outlet>
        <PodcastPlayer :miniplayer="miniplayer"></PodcastPlayer>
    </ion-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonRouterOutlet, IonPage } from '@ionic/vue';
import PodcastPlayer from '@/components/PodcastPlayer.vue';
import { IonIcon } from '@ionic/vue';
import { personCircleOutline } from 'ionicons/icons';

const route = useRoute();
const router = useRouter();

const miniplayer = computed(() => route.path !== '/app/home');

const goToProfile = () => {
    router.push('/app/profile');
};
</script>


<style scoped>
.header {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1000;
    padding: 24px;
}

.ios .header {
    padding-top: 48px;
}
</style>