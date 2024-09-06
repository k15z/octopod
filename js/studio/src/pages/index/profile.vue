<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h1>Profile</h1>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <pre>{{ JSON.stringify(profile, null, 2) }}</pre>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CreatorService, CreatorProfile } from '@/api';

const profile = ref<CreatorProfile | null>(null);

CreatorService.creatorProfile().then((response) => {
    profile.value = response;
});
</script>