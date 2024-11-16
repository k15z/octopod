<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-grid style="margin-bottom: 120px;">
        <ion-row>
          <ion-col>
            <ion-card color="dark" style="margin: 0;">
              <ion-card-content>
                <div class="profile-container">
                  <ion-avatar style="width: 120px; height: 120px; margin: 0 auto;">
                    <img :src="profile?.picture_url || '/profile.png'" alt="Profile Picture">
                  </ion-avatar>
                  <ion-text>
                    <h1 style="font-size: 24px; font-weight: 600; text-align: center; margin-top: 16px;">
                      {{ profile?.first_name }} {{ profile?.last_name }}
                    </h1>
                  </ion-text>
                  <p style="text-align: center; margin-top: 16px;">
                    <span style="display: inline-flex; align-items: center; color: var(--ion-color-primary);">
                      <ion-icon :icon="headset" style="margin-right: 4px;" /> {{
                        Math.floor((statistics?.seconds_listened ?? 0) / 60) }} minutes listened
                    </span>
                    <span
                      style="display: inline-flex; align-items: center; margin-left: 16px; color: var(--ion-color-success);">
                      <ion-icon :icon="stopwatch" style="margin-right: 4px;" /> {{
                        Math.floor((statistics?.seconds_saved ?? 0) / 60) }} minutes saved
                    </span>
                  </p>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-card color="dark" style="margin: 0;">
              <ion-card-content>
                <ion-grid>
                  <ion-row>
                    <ion-col style="text-align: center;">
                      <ion-text style="font-size: 24px; font-weight: 600;">
                        ${{ ((statistics?.lifetime_spend ?? 0) / 100.0).toFixed(2) }}
                      </ion-text>
                      <br />
                      <ion-text>
                        Paid
                      </ion-text>
                    </ion-col>
                    <ion-col style="text-align: center;">
                      <ion-text style="font-size: 24px; font-weight: 600;">
                        {{ statistics?.num_tips }}
                      </ion-text>
                      <br />
                      <ion-text>
                        Tips
                      </ion-text>
                    </ion-col>
                    <ion-col style="text-align: center;">
                      <ion-text style="font-size: 24px; font-weight: 600;">
                        {{ statistics?.creator_amounts.length }}
                      </ion-text>
                      <br />
                      <ion-text>
                        Creators
                      </ion-text>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-card color="dark" style="margin: 0;">
              <ion-card-content>
                <div style="display: flex; flex-direction: column; gap: 16px; width: 100%;">
                  <div v-for="creator in statistics?.creator_amounts" style="display: flex; align-items: center;">
                    <div style="margin-right: 16px; display: flex; align-items: center;">
                      <ion-avatar style="width: 48px; height: 48px; margin: 0 auto;">
                        <img :src="creator?.cover_url || '/podcast.png'" alt="Podcast">
                      </ion-avatar>
                    </div>
                    <div style="display: flex; flex-direction: column; justify-content: center;">
                      <ion-text
                        style="font-size: 18px; font-weight: 600; padding: 0; display: block; margin-bottom: 4px; line-height: 1;">
                        {{ creator.creator }}
                      </ion-text>
                      <ion-text
                        style="font-size: 14px; font-weight: 400; padding: 0; display: block; margin-top: 0; line-height: 1;">
                        ${{ ((creator.amount ?? 0) / 100.0).toFixed(2) }}
                      </ion-text>
                    </div>
                  </div>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-button color="dark" style="margin: 0;" expand="block" @click="logout">Logout</ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { IonHeader, IonContent, IonToolbar, IonButton, IonButtons, IonBackButton, IonCard, IonCardContent, IonPage, IonGrid, IonRow, IonCol, IonText, IonAvatar, IonIcon } from '@ionic/vue';
import storage from '../storage';
import { userProfile, UserProfile, userStatistics, UserStatistics } from '@/api';
import { timer, stopwatch, headset } from 'ionicons/icons';
const router = useRouter();

const openUmaAuth = () => {
  router.push('/auth');
}

const logout = () => {
  storage.access_token = "";
  router.push('/auth');
}

const profile = ref<UserProfile>();
const statistics = ref<UserStatistics>();

userProfile().then((res) => {
  profile.value = res.data;
});

userStatistics().then((res) => {
  statistics.value = res.data;
});
</script>
