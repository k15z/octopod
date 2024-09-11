<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h1>Dashboard</h1>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="4">
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
                        <v-list lines="one">
                            <v-list-item v-for="n in 5" :key="n" :title="'Item ' + n"
                                subtitle="Lorem ipsum dolor sit amet consectetur adipisicing elit"></v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
                <br />
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
                        <v-list lines="one">
                            <v-list-item v-for="n in 3" :key="n" :title="'Item ' + n"
                                subtitle="Lorem ipsum dolor sit amet consectetur adipisicing elit"></v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
                <br />
                <v-card>
                    <v-card-item>
                        <v-card-title>
                            Worst Performers
                        </v-card-title>
                        <v-card-subtitle>
                            Bottom of the barrel
                        </v-card-subtitle>
                    </v-card-item>
                    <v-card-text>
                        <v-list lines="one">
                            <v-list-item v-for="n in 3" :key="n" :title="'Item ' + n"
                                subtitle="Lorem ipsum dolor sit amet consectetur adipisicing elit"></v-list-item>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="4">
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
                        <table style="width:100%; text-align: center;">
                            <tbody>
                                <tr>
                                    <td class="pa-4">
                                        <span style="font-size:2em;">$210.32</span>
                                        <br />
                                        stream revenue
                                    </td>
                                    <td class="pa-4">
                                        <span style="font-size:2em;">$32.88</span>
                                        <br />
                                        tip revenue
                                    </td>
                                </tr>
                                <tr>
                                    <td class="pa-4">
                                        <span style="font-size:2em;">7,010</span>
                                        <br />
                                        unique plays
                                    </td>
                                    <td>
                                        <span style="font-size:2em;">24%</span>
                                        <br />
                                        skip rate
                                    </td>
                                </tr>
                                <tr>
                                    <td class="pa-4">
                                        <span style="font-size:2em;">194h 34m</span>
                                        <br />
                                        listen time
                                    </td>
                                    <td>
                                        <span style="font-size:2em;">426</span>
                                        <br />
                                        unique listeners
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </v-card-text>
                </v-card>
                <br />
                <v-card>
                    <v-card-item>
                        <v-card-title>
                            Audience
                        </v-card-title>
                        <v-card-subtitle>
                            Your listeners
                        </v-card-subtitle>
                    </v-card-item>
                    <v-card-text>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista
                        probare, quae sunt a te dicta? Refert tamen, quo modo. Quod autem in homine praestantissimum
                        atque optimum est, id deseruit. Quae cum dixisset, finem ille.
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="4">
                <v-card>
                    <v-card-item>
                        <v-card-title>
                            Insights
                        </v-card-title>
                        <v-card-subtitle>
                            Our advice
                        </v-card-subtitle>
                    </v-card-item>
                    <v-card-text>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne merninisti licere mihi ista
                        probare, quae sunt a te dicta? Refert tamen, quo modo. Quod autem in homine praestantissimum
                        atque optimum est, id deseruit. Quae cum dixisset, finem ille.
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ContentService, Podcast } from '@/api';

const podcasts = ref<Podcast[]>([]);

ContentService.listPodcasts().then((response) => {
    podcasts.value = response.results;
});
</script>