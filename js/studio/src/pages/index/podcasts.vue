<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h1>Podcasts</h1>
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
                        <template v-for="(podcast, i) in podcasts" :key="podcast.id">
                            <v-list-item class="pt-4 pb-4">
                                <template v-slot:prepend v-if="podcast.cover_url">
                                    <v-avatar color="grey-lighten-1">
                                        <v-img :src="podcast.cover_url" width="40" height="40"></v-img>
                                    </v-avatar>
                                </template>
                                <template v-slot:append>
                                    <template v-if="active_podcast_id === podcast.id">
                                        <v-btn @click="stop" color="grey-lighten-1" icon="mdi-stop" variant="text"></v-btn>
                                    </template>
                                    <template v-else>
                                        <v-btn @click="play(podcast)" color="grey-lighten-1" icon="mdi-play" variant="text"></v-btn>
                                    </template>
                                </template>
                                <v-list-item-title>{{ podcast.title }}</v-list-item-title>
                                <v-list-item-subtitle>
                                    <b>
                                        {{ `~${Math.round(podcast.duration / 60)} minutes` }} | 
                                        {{ (new Date(podcast.published_at!)).toLocaleDateString() }} | 
                                        {{ podcast.creator_name }}
                                    </b>
                                    <br/>
                                    {{ podcast.description }}</v-list-item-subtitle>
                            </v-list-item>
                            <v-divider v-if="i < podcasts.length - 1"></v-divider>
                        </template>
                    </v-list>
                </v-col>
            </v-row>
        </template>
    </v-container>
    <v-dialog max-width="500">
        <template v-slot:activator="{ props: activatorProps }">
            <v-fab v-bind="activatorProps" icon="mdi-plus" class="mb-4 ms-n4" color="#1DB954" location="bottom end"
                absolute app appear></v-fab>
        </template>
        <template v-slot:default="{ isActive }">
            <CreatePodcast @created="isActive.value = false"></CreatePodcast>
        </template>
    </v-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ContentService, Podcast } from '@/api';
import CreatePodcast from '@/components/CreatePodcast.vue';

const is_loading = ref(true);
const podcasts = ref<Podcast[]>([]);

let audio: HTMLAudioElement | null = null;
const active_podcast_id = ref<string | null>(null);

function play(podcast: Podcast) {
    stop();
    active_podcast_id.value = podcast.id;
    audio = new Audio(podcast.audio_url!);
    audio.play();
}

function stop() {
    active_podcast_id.value = null;
    if (audio) {
        audio.pause();
        audio = null;
    }
}

ContentService.listPodcasts().then((response) => {
    podcasts.value = response.results;
    is_loading.value = false;
});
</script>