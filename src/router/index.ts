import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),  // 自动使用 vite.config.ts 中的 base 值
  routes: [
    {
      path: '/',
      component: AppLayout,
      redirect: '/stage1/lesson01',
      children: [
        /** ===== 第一阶段：入门基础 ===== */
        {
          path: 'stage1/lesson01',
          name: 'lesson01',
          component: () => import('@/views/stage1/Lesson01_MapIntro.vue'),
          meta: { title: '认识 MapLibre' }
        },
        {
          path: 'stage1/lesson02',
          name: 'lesson02',
          component: () => import('@/views/stage1/Lesson02_FirstMap.vue'),
          meta: { title: '第一张地图' }
        },
        {
          path: 'stage1/lesson03',
          name: 'lesson03',
          component: () => import('@/views/stage1/Lesson03_MapOperations.vue'),
          meta: { title: '地图基础操作' }
        },
        {
          path: 'stage1/lesson04',
          name: 'lesson04',
          component: () => import('@/views/stage1/Lesson04_MapControls.vue'),
          meta: { title: '地图控件' }
        },

        /** ===== 第八阶段：实战项目 ===== */
        {
          path: 'stage8/soil-ph',
          name: 'soilPh',
          component: () => import('@/views/SoilPhMap.vue'),
          meta: { title: '土壤检测可视化' }
        }
      ]
    },
    /** 旧路由兼容重定向 */
    { path: '/soil-ph', redirect: '/stage8/soil-ph' },
    { path: '/bindmap/:pathMatch(.*)*', redirect: '/stage1/lesson01' },
    { path: '/bindtools/:pathMatch(.*)*', redirect: '/stage1/lesson01' },
    /** 404 兜底 */
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach((to) => {
  document.title = (to.meta.title as string) || 'MapLibre 地图展示'
})

export default router
