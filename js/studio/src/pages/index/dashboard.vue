<template>
    <v-container class="content">
        <v-row>
            <v-col cols="12">
                <h1>Dashboard</h1>
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
                <v-col cols="12" md="6" lg="4">
                    <v-card>
                        <v-card-item>
                            <v-card-title>
                                Top Podcasts
                            </v-card-title>
                            <v-card-subtitle>
                                Your top hits
                            </v-card-subtitle>
                        </v-card-item>
                        <v-card-text>
                            <v-list lines="three">
                                <v-list-item v-for="podcast in dashboard?.top_podcasts" :key="podcast.id"
                                    :title="podcast.title" :subtitle=podcast.description></v-list-item>
                            </v-list>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" md="6" lg="4">
                    <v-card>
                        <v-card-item>
                            <v-card-title>
                                Analytics
                            </v-card-title>
                            <v-card-subtitle>
                                Last 28 days
                            </v-card-subtitle>
                        </v-card-item>
                        <v-card-text>
                            <table v-if="dashboard" style="width:100%; text-align: center;">
                                <tbody>
                                    <tr>
                                        <td class="pa-4">
                                            <span style="font-size:2em;">${{ dashboard?.statistics.stream_revenue
                                                }}</span>
                                            <br />
                                            stream revenue
                                        </td>
                                        <td class="pa-4">
                                            <span style="font-size:2em;">${{ dashboard?.statistics.tip_revenue }}</span>
                                            <br />
                                            tip revenue
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="pa-4">
                                            <span style="font-size:2em;">{{ dashboard?.statistics.num_plays }}</span>
                                            <br />
                                            unique plays
                                        </td>
                                        <td>
                                            <span style="font-size:2em;">{{ (dashboard?.statistics.skip_rate *
                                                100).toFixed(2) }}%</span>
                                            <br />
                                            skip rate
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="pa-4">
                                            <span style="font-size:2em;">{{ dashboard?.statistics.seconds_played
                                                }}</span>
                                            <br />
                                            listen time
                                        </td>
                                        <td>
                                            <span style="font-size:2em;">{{ dashboard?.statistics.num_listeners
                                                }}</span>
                                            <br />
                                            unique listeners
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </v-card-text>
                    </v-card>
                </v-col>
                <v-col cols="12" md="6" lg="4">
                    <v-card>
                        <v-card-item>
                            <v-card-title>
                                Top Podclips
                            </v-card-title>
                            <v-card-subtitle>
                                Our top picks
                            </v-card-subtitle>
                        </v-card-item>
                        <v-card-text>
                            <v-list lines="three">
                                <v-list-item v-for="podclip in dashboard?.top_podclips" :key="podclip.id"
                                    :title="podclip.title" :subtitle="podclip.description"></v-list-item>
                            </v-list>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </template>
    </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { CreatorService, DashboardReponse } from '@/api';

const is_loading = ref(true);
const dashboard = ref<DashboardReponse | null>(null);

CreatorService.creatorDashboard().then((response) => {
    dashboard.value = response;
    is_loading.value = false;
});
</script>

<style scoped>
.content {
    max-height: 100vh;
    overflow-y: auto;
}
</style>
