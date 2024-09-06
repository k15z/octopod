<template>
    <v-app-bar app>
        <v-btn to="/" icon>
            <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-toolbar-title>
            <p>Podclips</p>
        </v-toolbar-title>
    </v-app-bar>
    <v-container class="fill-height">
        <v-responsive class="align-centerfill-height mx-auto" max-width="1200">
            <v-table>
                <thead>
                    <tr>
                        <th class="text-right">
                            Start
                        </th>
                        <th class="text-right">
                            End
                        </th>
                        <th class="text-right">
                            Duration
                        </th>
                        <th class="text-left">
                            Title
                        </th>
                        <th class="text-right">

                        </th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="podclip in podclips" :key="podclip.id">
                        <tr>
                            <td class="text-right">
                                {{ formatSecondsToMMSS(podclip.start_time) }}
                            </td>
                            <td class="text-right">
                                {{ formatSecondsToMMSS(podclip.end_time) }}
                            </td>
                            <td class="text-right">
                                {{ formatSecondsToMMSS(podclip.end_time - podclip.start_time) }}
                            </td>
                            <td>
                                {{ podclip.title }}
                            </td>
                            <td class="text-right">
                                <audio style="padding:0.7em" :src="podclip.audio_url" controls></audio>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </v-table>
        </v-responsive>
    </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { ContentService, Podclip } from '@/api';

const podclips = ref<Podclip[]>([]);
const route = useRoute();
const podcastId = route.params.id as string;

function formatSecondsToMMSS(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

ContentService.listPodclips(
    '',
    0,
    360000,
    podcastId,
).then((response) => {
    podclips.value = response.results;
});
</script>