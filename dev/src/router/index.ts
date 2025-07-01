import { createRouter, createWebHistory } from 'vue-router'
import Tr from '@/i18n/translation'
import HomeView from '@/views/HomeView.vue'
import ArticleView from '@/views/ArticleView.vue'
import PageNotFound from '@/views/PageNotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.BASE_URL),
  scrollBehavior() {
    window.scrollTo(0, 0)
  },
  routes: [
    {
      path: '/:locale?',
      name: 'home',
      component: HomeView,
      beforeEnter: Tr.routeMiddleware
    },
    {
      path: '/:locale/:slug+',
      component: ArticleView,
      beforeEnter: Tr.routeMiddleware
    },
    {
      path: '/:locale/404',
      name: 'pageNotFound',
      component: PageNotFound,
      beforeEnter: Tr.routeMiddleware
    }
  ]
})

export default router
