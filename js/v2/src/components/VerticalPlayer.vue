<template>
    <div @click=togglePlay class="vertical-player" v-bind:class="variant">
        <div v-if="!is_playing" class="center-play-button" :class="{ miniplayer: miniplayer }">
            <ion-icon :icon="playCircleOutline"></ion-icon>
        </div>
        <div class="info-bar">
            <div class="info-bar-content">
                <div class="thumbnail">
                    <div class="placeholder-image"></div>
                </div>
                <div class="text-content">
                    <h2 class="title">{{ title }}</h2>
                    <p class="subtitle">{{ subtitle }}</p>
                </div>
                <ion-progress-bar :value=state.progress color="dark"></ion-progress-bar>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import state from '@/state';
import { IonProgressBar } from '@ionic/vue';
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import { playCircleOutline } from 'ionicons/icons';

const props = defineProps<{
    title: string;
    subtitle: string;
    variant: 'v1' | 'v2' | 'v3';
    url: string;
    miniplayer: boolean;
}>();

const togglePlay = () => {
    state.is_playing = !state.is_playing;
    if (state.is_playing) {
        state.active_item = props;
    }
};

const is_playing = computed(() => state.is_playing && state.active_item!.title === props.title);
</script>

<style scoped>
.vertical-player {
    height: 100%;
    width: 100%;
}

.vertical-player.v1 {
    background-image: linear-gradient(135deg, rgb(255, 160, 122), rgb(78, 205, 196)), linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
}

.vertical-player.v2 {
    background-image: linear-gradient(135deg, rgb(106, 205, 99), rgb(78, 103, 205)), linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
}

.vertical-player.v3 {
    background-image: linear-gradient(135deg, rgb(255, 122, 226), rgb(78, 205, 196)), linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%);
}

.info-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
}

.ios .info-bar {
    padding-bottom: 40px;
}

.info-bar .title {
    margin: 0;
    padding: 0;
}

.info-bar .subtitle {
    margin-top: 0;
    padding-top: 0;
}

.center-play-button {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.center-play-button.miniplayer {
    justify-content: right;
    padding-right: 20px;
    padding-bottom: 20px;
}

.center-play-button.miniplayer ::v-deep(ion-icon) {
    font-size: 48px !important;
}

::v-deep(ion-icon) {
    font-size: 64px !important;
}
</style>
