<template>
  <v-container class="fill-height">
    <v-responsive class="align-centerfill-height mx-auto" max-width="900">
      <h1 class="text-h2">Octopod</h1>
      <br />
      <br />
      <ul class="pl-6" style="color:white;">
        <li v-for="podcast in podcasts" :key="podcast.id">
          {{toRelativeTime(podcast.published_at!)}} - <router-link :to="'/podcast/' + podcast.id">{{ podcast.id }}</router-link>
        </li>
      </ul>
    </v-responsive>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { DateTime } from "luxon";
import { ContentService, Podcast } from '@/api';

const podcasts = ref<Podcast[]>([]);

function toRelativeTime(time: string) {
  return DateTime.fromISO(time).toRelative();
}

ContentService.listPodcasts().then((response) => {
  podcasts.value = response.results;
});
</script>
