import { createRouter, createWebHistory } from 'vue-router'
import Tr from '@/i18n/translation'
import ArticleView from '@/views/ArticleView.vue'
import PageNotFound from '@/views/PageNotFound.vue'

const routes = [
  {
    path: '/:locale?',
    name: 'home',
    component: ArticleView,
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

if (import.meta.env.DEV) {
  routes.push({
    path: '/:locale/dev',
    name: 'dev',
    component: () => import('@/views/DevView.vue'),
    beforeEnter: Tr.routeMiddleware
  })
}

const router = createRouter({
  history: createWebHistory(import.meta.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return new Promise( resolve => {
      setTimeout(() => {
        if (to.hash) {
          resolve({
            el: to.hash,
            behavior: 'smooth'
          })
        }

        if (savedPosition) {
          resolve({
            top: savedPosition.top,
            left: savedPosition.left,
            behavior: 'instant'
          })
        }

        resolve({
          top: 0,
          left: 0,
          behavior: 'instant'
        })
      }, 100)
    })
  },
  routes: routes
})

export default router
