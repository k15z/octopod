<template>
  <v-container class="fill-height">
    <v-responsive class="align-centerfill-height mx-auto" max-width="900">
      <h1 class="text-h2">Octopod</h1>
      <br />
      <br />
      <h3>Usage</h3>
      <p>
        To submit a podcast, use the following command:
      </p>
      <br />
      <pre class="pl-4">curl -s http://localhost:8000/api/v1/submit -F "file=@examples/podcast.mp3"</pre>
      <br/>
      <br />
      <h3 class="">Recent</h3>
      <p>
        Here are the most recent submissions:
      </p>
      <br />
      <ul class="pl-6" style="color:white;">
        <li v-for="submission in submissions" :key="submission.id">
          {{toRelativeTime(submission.created_at)}} - <router-link :to="'/submission/' + submission.id">{{ submission.id }}</router-link>
        </li>
      </ul>
    </v-responsive>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { DateTime } from "luxon";
import { DefaultService, SubmissionResponse } from '@/api';

const submissions = ref<SubmissionResponse[]>(null);

function toRelativeTime(time: string) {
  return DateTime.fromISO(time).toRelative();
}

DefaultService.listSubmissions().then((response) => {
  submissions.value = response.submissions;
});
</script>
