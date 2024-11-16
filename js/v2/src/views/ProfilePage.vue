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
      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-button color="dark" style="margin: 0;" expand="block" @click="logout">Logout</ion-button>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-button style="margin: 0;" expand="block" @click="openUmaAuth">Connect your UMA</ion-button>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col>
            <ion-card style="margin: 0;">
              <ion-card-header>
                <ion-card-title>Card Title</ion-card-title>
                <ion-card-subtitle>Card Subtitle</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                Here's a small text description for the card content. Nothing more, nothing less.
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IonHeader, IonContent, IonToolbar, IonButton, IonButtons, IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonPage, IonGrid, IonRow, IonCol } from '@ionic/vue';
import storage from '../storage';

const router = useRouter();

const openUmaAuth = () => {
  router.push('/auth');
}

const logout = () => {
  storage.access_token = "";
  router.push('/auth');
}
</script>
