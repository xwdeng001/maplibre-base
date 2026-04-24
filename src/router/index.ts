import { createRouter, createWebHashHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),  // Hash 模式，静态托管刷新不丢路由
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

        /** ===== 第二阶段：样式与数据源 ===== */
        {
          path: 'stage2/lesson05',
          name: 'lesson05',
          component: () => import('@/views/stage2/Lesson05_MapStyles.vue'),
          meta: { title: '地图样式详解' }
        },
        {
          path: 'stage2/lesson06',
          name: 'lesson06',
          component: () => import('@/views/stage2/Lesson06_Sources.vue'),
          meta: { title: '数据源 Sources' }
        },
        {
          path: 'stage2/lesson07',
          name: 'lesson07',
          component: () => import('@/views/stage2/Lesson07_GeoJSON.vue'),
          meta: { title: 'GeoJSON 数据实战' }
        },
        {
          path: 'stage2/lesson08',
          name: 'lesson08',
          component: () => import('@/views/stage2/Lesson08_Tiles.vue'),
          meta: { title: '矢量瓦片与栅格瓦片' }
        },

        /** ===== 第三阶段：图层类型精讲 ===== */
        {
          path: 'stage3/lesson09',
          name: 'lesson09',
          component: () => import('@/views/stage3/Lesson09_Fill.vue'),
          meta: { title: 'Fill 填充图层' }
        },
        {
          path: 'stage3/lesson10',
          name: 'lesson10',
          component: () => import('@/views/stage3/Lesson10_Line.vue'),
          meta: { title: 'Line 线图层' }
        },
        {
          path: 'stage3/lesson11',
          name: 'lesson11',
          component: () => import('@/views/stage3/Lesson11_Symbol.vue'),
          meta: { title: 'Symbol 符号图层' }
        },
        {
          path: 'stage3/lesson12',
          name: 'lesson12',
          component: () => import('@/views/stage3/Lesson12_Circle.vue'),
          meta: { title: 'Circle 圆点图层' }
        },
        {
          path: 'stage3/lesson13',
          name: 'lesson13',
          component: () => import('@/views/stage3/Lesson13_Heatmap.vue'),
          meta: { title: 'Heatmap 热力图层' }
        },
        {
          path: 'stage3/lesson14',
          name: 'lesson14',
          component: () => import('@/views/stage3/Lesson14_FillExtrusion.vue'),
          meta: { title: 'Fill-extrusion 3D 建筑' }
        },

        /** ===== 第四阶段：交互与覆盖物 ===== */
        {
          path: 'stage4/lesson15',
          name: 'lesson15',
          component: () => import('@/views/stage4/Lesson15_Marker.vue'),
          meta: { title: 'Marker 标记点' }
        },
        {
          path: 'stage4/lesson16',
          name: 'lesson16',
          component: () => import('@/views/stage4/Lesson16_Popup.vue'),
          meta: { title: 'Popup 弹窗' }
        },
        {
          path: 'stage4/lesson17',
          name: 'lesson17',
          component: () => import('@/views/stage4/Lesson17_Interaction.vue'),
          meta: { title: '要素交互' }
        },
        {
          path: 'stage4/lesson18',
          name: 'lesson18',
          component: () => import('@/views/stage4/Lesson18_Draw.vue'),
          meta: { title: '绘制与测量' }
        },

        /** ===== 第五阶段：表达式与高级样式 ===== */
        {
          path: 'stage5/lesson19',
          name: 'lesson19',
          component: () => import('@/views/stage5/Lesson19_Expressions.vue'),
          meta: { title: '表达式系统入门' }
        },
        {
          path: 'stage5/lesson20',
          name: 'lesson20',
          component: () => import('@/views/stage5/Lesson20_DataDriven.vue'),
          meta: { title: '数据驱动样式' }
        },
        {
          path: 'stage5/lesson21',
          name: 'lesson21',
          component: () => import('@/views/stage5/Lesson21_Filter.vue'),
          meta: { title: '图层过滤 Filter' }
        },
        {
          path: 'stage5/lesson22',
          name: 'lesson22',
          component: () => import('@/views/stage5/Lesson22_RuntimeStyle.vue'),
          meta: { title: '运行时样式修改' }
        }
      ]
    },
    /** 404 兜底 */
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach((to) => {
  document.title = (to.meta.title as string) || 'MapLibre 地图展示'
})

export default router
