<script setup lang="ts">
/**
 * 第01课：认识 MapLibre GL JS
 * 介绍页面，展示 MapLibre 的核心特性和与其他地图库的对比
 * 知识点文档：docs/lessons/01-认识-MapLibre-GL-JS.md
 */

/** 核心特性数据 */
const features = [
  { icon: '🎨', title: '矢量渲染', desc: '基于 WebGL 的矢量瓦片渲染，地图清晰可定制' },
  { icon: '🆓', title: '完全开源', desc: 'BSD-3 许可证，无商业限制，永久免费' },
  { icon: '⚡', title: '高性能', desc: 'GPU 加速渲染，轻松应对 10 万+ 数据点' },
  { icon: '🌐', title: '3D 支持', desc: '地形、3D 建筑拉伸、Globe 地球模式' },
  { icon: '📐', title: '表达式系统', desc: '强大的数据驱动样式，按属性动态着色' },
  { icon: '📱', title: '移动友好', desc: '触摸手势支持，移动端性能优秀' },
  { icon: '🔌', title: '生态丰富', desc: '兼容 Mapbox 生态，插件众多' },
  { icon: '🛠️', title: 'TypeScript', desc: '原生 TypeScript 支持，类型安全' }
]

const compareColumns = [
  { title: '维度', dataIndex: 'dimension', width: 130 },
  { title: 'MapLibre GL JS', dataIndex: 'maplibre' },
  { title: 'Leaflet', dataIndex: 'leaflet' },
  { title: 'OpenLayers', dataIndex: 'openlayers' },
  { title: 'Cesium', dataIndex: 'cesium' }
]

const compareData = [
  { key: '1', dimension: '渲染方式', maplibre: 'WebGL 矢量', leaflet: 'DOM/Canvas', openlayers: 'Canvas/WebGL', cesium: 'WebGL 3D' },
  { key: '2', dimension: '包体积', maplibre: '~250KB', leaflet: '~42KB', openlayers: '~300KB', cesium: '~1MB+' },
  { key: '3', dimension: '学习曲线', maplibre: '中等', leaflet: '低', openlayers: '高', cesium: '高' },
  { key: '4', dimension: '矢量瓦片', maplibre: '✅ 原生', leaflet: '❌ 需插件', openlayers: '✅ 原生', cesium: '⚠️ 有限' },
  { key: '5', dimension: '3D 地形', maplibre: '✅ 支持', leaflet: '❌', openlayers: '❌', cesium: '✅ 核心' },
  { key: '6', dimension: '热力图', maplibre: '✅ 原生', leaflet: '⚠️ 插件', openlayers: '✅', cesium: '❌' },
  { key: '7', dimension: '移动端', maplibre: '⭐ 优秀', leaflet: '⭐ 优秀', openlayers: '⚠️ 一般', cesium: '❌ 较差' },
  { key: '8', dimension: '许可协议', maplibre: 'BSD-3', leaflet: 'BSD-2', openlayers: 'BSD-2', cesium: 'Apache 2.0' }
]

const scenes = [
  { icon: '🗺️', title: '专题地图', desc: '分级设色图、热力图、区域数据可视化等 GIS 专题展示' },
  { icon: '🚗', title: '实时追踪', desc: '车辆轨迹、物流配送、外卖骑手等实时位置追踪' },
  { icon: '🏙️', title: '智慧城市', desc: '城市管理、设施巡检、管网可视化等城市级应用' },
  { icon: '🌾', title: '农业监测', desc: '土壤检测、农田管理、作物分布等精准农业场景' },
  { icon: '📊', title: '数据看板', desc: '地理数据仪表板、区域统计看板、运营分析' },
  { icon: '🏗️', title: '数字孪生', desc: '园区/建筑 3D 可视化、BIM 轻量化展示' }
]
</script>

<template>
  <div class="lesson-page">
    <div class="lesson-content">
      <h1>01. 认识 MapLibre GL JS</h1>
      <p class="lesson-desc">MapLibre GL JS 是一个开源的 WebGL 地图渲染引擎，从 Mapbox GL JS v1 分叉而来，完全免费无商业限制。</p>
      <p class="lesson-doc-hint">📄 配套知识点：<code>docs/lessons/01-认识-MapLibre-GL-JS.md</code>（总目录见 <code>docs/lessons/README.md</code>）</p>

      <!-- 核心特性 -->
      <a-card title="核心特性" class="lesson-card">
        <a-row :gutter="[16, 16]">
          <a-col :span="6" v-for="item in features" :key="item.title">
            <a-card size="small" hoverable class="feature-card">
              <div class="feature-icon">{{ item.icon }}</div>
              <div class="feature-title">{{ item.title }}</div>
              <div class="feature-desc">{{ item.desc }}</div>
            </a-card>
          </a-col>
        </a-row>
      </a-card>

      <!-- 地图库对比 -->
      <a-card title="与其他地图库对比" class="lesson-card">
        <a-table :columns="compareColumns" :data-source="compareData" :pagination="false" size="middle" bordered />
      </a-card>

      <!-- 应用场景 -->
      <a-card title="典型应用场景" class="lesson-card">
        <a-row :gutter="[16, 16]">
          <a-col :span="8" v-for="scene in scenes" :key="scene.title">
            <a-card size="small">
              <template #title>
                <span>{{ scene.icon }} {{ scene.title }}</span>
              </template>
              {{ scene.desc }}
            </a-card>
          </a-col>
        </a-row>
      </a-card>
    </div>
  </div>
</template>

<style scoped>
.lesson-page {
  height: 100%;
  overflow-y: auto;
  background: #f5f7fa;
}

.lesson-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}

.lesson-content h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.lesson-desc {
  color: #666;
  font-size: 15px;
  margin-bottom: 8px;
}

.lesson-doc-hint {
  font-size: 13px;
  color: #888;
  margin-bottom: 24px;
}

.lesson-doc-hint code {
  font-size: 12px;
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.lesson-card {
  margin-bottom: 20px;
}

.feature-card {
  text-align: center;
  height: 100%;
}

.feature-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.feature-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.feature-desc {
  font-size: 12px;
  color: #888;
  line-height: 1.5;
}
</style>
