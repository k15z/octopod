<template>
    <v-card>
        <v-card-item>
            <v-card-title>
                Upload Podcast
            </v-card-title>
            <v-card-subtitle>
                Add a new podcast
            </v-card-subtitle>
        </v-card-item>
        <v-card-text>
            <v-text-field density="compact" variant="outlined" v-model="podcast.title" label="Title"></v-text-field>
            <v-textarea density="compact" variant="outlined" v-model="podcast.description" label="Description"></v-textarea>
            <PresignedUpload v-model="podcast.audio_url" kind="audio"></PresignedUpload>
            <PresignedUpload v-model="podcast.cover_url" kind="image"></PresignedUpload>
            <v-btn block color="#1DB954" @click="createPodcast">Create Podcast</v-btn>
        </v-card-text>
    </v-card>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import { ContentService, CreatePodcastRequest } from '@/api';

const emits = defineEmits(['created']);

const podcast = ref<CreatePodcastRequest>({
    title: '',
    description: '',
    audio_url: '',
    cover_url: '',
    published_at: new Date().toISOString()
});

async function createPodcast() {
    try {
        await ContentService.createPodcast(podcast.value);
        console.log('Podcast created successfully');
        emits('created');
    } catch (err) {
        console.error(err);
    }
}
</script>
