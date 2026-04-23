import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AppLayout,
      redirect: '/soil-ph',
      children: [
        /** 土壤检测分析 */
        {
          path: 'soil-ph',
          name: 'soilPh',
          component: () => import('@/views/SoilPhMap.vue'),
          meta: { title: '土壤pH分布图' }
        },
        /** 地图可视化 */
        {
          path: 'bindmap/bindmap1',
          name: 'bindmap1',
          component: () => import('@/views/bindmap/BindMap1.vue'),
          meta: { title: '地图基础展示' }
        },
        /** 地图工具 */
        {
          path: 'bindtools/bindtool1',
          name: 'bindtool1',
          component: () => import('@/views/bindtools/BindTool1.vue'),
          meta: { title: '标注与测量' }
        }
      ]
    }
  ]
})

router.beforeEach((to) => {
  document.title = (to.meta.title as string) || 'MapLibre 地图展示'
})

export default router
