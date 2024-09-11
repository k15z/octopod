<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h1>Podclips</h1>
            </v-col>
        </v-row>
        <template v-if="is_loading">
            <v-row>
                <v-col cols="12">
                    <v-progress-linear indeterminate color="primary"></v-progress-linear>
                </v-col>
            </v-row>
        </template>
        <template v-else>
            <v-row>
                <v-col cols="12">
                    <v-list lines="three">
                        <template v-for="(podclip, i) in podclips" :key="podclip.id">
                            <v-list-item class="pt-4 pb-4">
                                <template v-slot:prepend v-if="podclip.podcast.cover_url">
                                    <v-avatar color="grey-lighten-1">
                                        <v-img :src="podclip.podcast.cover_url" width="40" height="40"></v-img>
                                    </v-avatar>
                                </template>
                                <template v-slot:append>
                                    <template v-if="active_podclip_id === podclip.id">
                                        <v-btn @click="stop" color="grey-lighten-1" icon="mdi-stop" variant="text"></v-btn>
                                    </template>
                                    <template v-else>
                                        <v-btn @click="play(podclip)" color="grey-lighten-1" icon="mdi-play" variant="text"></v-btn>
                                    </template>
                                </template>
                                <v-list-item-title>{{ podclip.title }}</v-list-item-title>
                                <v-list-item-subtitle>
                                    <b>
                                        {{ `~${Math.round(podclip.duration / 60)} minutes` }} | 
                                        {{ (new Date(podclip.podcast.published_at!)).toLocaleDateString() }} | 
                                        {{ podclip.podcast.creator_name }}
                                    </b>
                                    <br/>
                                    {{ podclip.description }}</v-list-item-subtitle>
                            </v-list-item>
                            <v-divider v-if="i < podclips.length - 1"></v-divider>
                        </template>
                    </v-list>
                </v-col>
            </v-row>
        </template>
    </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ContentService, Podclip } from '@/api';

const is_loading = ref(true);
const podclips = ref<Podclip[]>([]);

let audio: HTMLAudioElement | null = null;
const active_podclip_id = ref<string | null>(null);

function play(podclip: Podclip) {
    stop();
    active_podclip_id.value = podclip.id;
    audio = new Audio(podclip.audio_url!);
    audio.play();
}

function stop() {
    active_podclip_id.value = null;
    if (audio) {
        audio.pause();
        audio = null;
    }
}

ContentService.listPodclips().then((response) => {
    podclips.value = response.results;
    is_loading.value = false;
});
</script>