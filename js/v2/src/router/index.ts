import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import AppPage from '../views/AppPage.vue';
import AuthPage from '../views/AuthPage.vue';
import HomePage from '../views/HomePage.vue';
import ProfilePage from '../views/ProfilePage.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/app'
  },
  {
    path: '/auth',
    component: AuthPage
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
