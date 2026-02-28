import { createRouter, createWebHistory,createWebHashHistory } from 'vue-router'

import Home from './pages/Home.vue'
import Tools from './pages/Tools/Tools.vue'
// Lazy-loaded sub-tools
const routes = [
  { path: '/', component: Home },
  {
    path: '/tools',
    component: Tools,
    children: [
      { path: 'image', component: () => import('./pages/Tools/ImageConverter.vue') },
      { path: 'base64', component: () => import('./pages/Tools/Base64Tool.vue') },
      { path: 'hash', component: () => import('./pages/Tools/HashTool.vue') },
      { path: 'haruhikage', component: () => import('./pages/Tools/Haruhikage.vue') },
      { path: 'qr', component: () => import('./pages/Tools/QRCode.vue') },
      { path: 'objection', component: () => import('./pages/Tools/Objection.vue') }
    ]
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
