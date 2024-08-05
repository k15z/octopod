<template>
    <v-app-bar app>
        <v-btn to="/" icon>
            <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-toolbar-title>
            <template v-if="submission?.status != 'COMPLETE'">
                <p>Submission</p>
            </template>
            <template v-else>
                <p>Highlights</p>
            </template>
        </v-toolbar-title>
    </v-app-bar>
    <v-container class="fill-height">
        <v-responsive class="align-centerfill-height mx-auto" max-width="1200">
            <template v-if="submission?.status != 'COMPLETE'">
                <div class="text-center">
                    <div class="text-left" style="display: inline-block; width: 200px;">
                        <p>
                            <b>Status:</b> {{ submission?.status }}
                            <br />
                            <b>Progress:</b> {{ (100.0 * submission?.progress).toFixed(2) }}%
                            <br />
                            <b>Duration:</b> {{ formatSecondsToMMSS(submission?.duration) }}
                        </p>
                    </div>
                </div>
            </template>
            <template v-else>
                <v-table>
                    <thead>
                        <tr>
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
                        <template v-for="highlight in submission?.highlights" :key="highlight.id">
                            <tr>
                                <td class="text-right">
                                    {{ formatSecondsToMMSS(highlight.end_time - highlight.start_time) }}
                                </td>
                                <td>
                                    {{ highlight.title }}
                                </td>
                                <td class="text-right">
                                    <audio style="padding:0.7em" :src="basePath + '/api/v1/highlight/' + highlight.id"
                                        controls></audio>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </v-table>
            </template>
        </v-responsive>
    </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { OpenAPI, DefaultService, SubmissionWithHighlightsResponse } from '@/api';

const route = useRoute();
const basePath = OpenAPI.BASE;
const submissionId = route.params.id;
const submission = ref<SubmissionWithHighlightsResponse>(null);

function formatSecondsToMMSS(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = parseInt(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

DefaultService.getSubmission(submissionId).then((response) => {
    submission.value = response;
});
</script>