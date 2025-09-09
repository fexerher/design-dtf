import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const HomeView = () => import('@/views/HomeView.vue')
const EditorView = () => import('@/views/EditorView.vue')

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/editor', name: 'editor', component: EditorView },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
