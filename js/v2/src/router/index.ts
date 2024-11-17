import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import AppPage from '../views/AppPage.vue';
import AuthPage from '../views/AuthPage.vue';
import HomePage from '../views/HomePage.vue';
import ProfilePage from '../views/ProfilePage.vue';
import storage from '../storage';
import CreatePage from '../views/CreatePage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: storage.access_token ? '/app' : '/auth'
  },
  {
    path: '/auth',
    component: AuthPage
  },
  {
    path: '/create',
    component: CreatePage
  },
  {
    path: '/app/',
    component: AppPage,
    children: [
      {
        path: '',
        redirect: '/app/home'
      },
      {
        path: 'home',
        component: HomePage
      },
      {
        path: 'profile',
        component: ProfilePage
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
