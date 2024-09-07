<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h1>Podcasts</h1>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <pre>{{ JSON.stringify(podcasts, null, 2) }}</pre>
            </v-col>
        </v-row>
    </v-container>
    <v-fab icon="mdi-plus" class="mb-4 ms-n4" color="#1DB954" location="bottom end" absolute app appear></v-fab>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ContentService, Podcast } from '@/api';

const podcasts = ref<Podcast[]>([]);

ContentService.listPodcasts().then((response) => {
    podcasts.value = response.results;
});
</script>