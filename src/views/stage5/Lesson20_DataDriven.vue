<script setup lang="ts">
/**
 * 第20课：数据驱动样式
 * 演示 interpolate/step 插值与分级设色地图
 */
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 驱动模式 */
const driveMode = ref<'interpolate' | 'step'>('interpolate')

/** 驱动属性 */
const driveTarget = ref<'color' | 'radius' | 'both'>('color')

/** 模拟区域数据 */
const areasData: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', id: 1, geometry: { type: 'Polygon', coordinates: [[[116.30, 39.97], [116.38, 39.97], [116.38, 39.92], [116.30, 39.92], [116.30, 39.97]]] }, properties: { name: '区域A', value: 15, population: 85 } },
    { type: 'Feature', id: 2, geometry: { type: 'Polygon', coordinates: [[[116.38, 39.97], [116.46, 39.97], [116.46, 39.92], [116.38, 39.92], [116.38, 39.97]]] }, properties: { name: '区域B', value: 45, population: 230 } },
    { type: 'Feature', id: 3, geometry: { type: 'Polygon', coordinates: [[[116.46, 39.97], [116.54, 39.97], [116.54, 39.92], [116.46, 39.92], [116.46, 39.97]]] }, properties: { name: '区域C', value: 78, population: 310 } },
    { type: 'Feature', id: 4, geometry: { type: 'Polygon', coordinates: [[[116.30, 39.92], [116.38, 39.92], [116.38, 39.87], [116.30, 39.87], [116.30, 39.92]]] }, properties: { name: '区域D', value: 32, population: 150 } },
    { type: 'Feature', id: 5, geometry: { type: 'Polygon', coordinates: [[[116.38, 39.92], [116.46, 39.92], [116.46, 39.87], [116.38, 39.87], [116.38, 39.92]]] }, properties: { name: '区域E', value: 91, population: 420 } },
    { type: 'Feature', id: 6, geometry: { type: 'Polygon', coordinates: [[[116.46, 39.92], [116.54, 39.92], [116.54, 39.87], [116.46, 39.87], [116.46, 39.92]]] }, properties: { name: '区域F', value: 58, population: 195 } },
    { type: 'Feature', id: 7, geometry: { type: 'Polygon', coordinates: [[[116.30, 39.87], [116.38, 39.87], [116.38, 39.82], [116.30, 39.82], [116.30, 39.87]]] }, properties: { name: '区域G', value: 67, population: 275 } },
    { type: 'Feature', id: 8, geometry: { type: 'Polygon', coordinates: [[[116.38, 39.87], [116.46, 39.87], [116.46, 39.82], [116.38, 39.82], [116.38, 39.87]]] }, properties: { name: '区域H', value: 23, population: 110 } },
    { type: 'Feature', id: 9, geometry: { type: 'Polygon', coordinates: [[[116.46, 39.87], [116.54, 39.87], [116.54, 39.82], [116.46, 39.82], [116.46, 39.87]]] }, properties: { name: '区域I', value: 85, population: 380 } }
  ]
}

/** 散点数据 */
function generatePoints(): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = []
  for (let i = 0; i < 40; i++) {
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [116.28 + Math.random() * 0.28, 39.82 + Math.random() * 0.16] },
      properties: { name: `点${i + 1}`, value: Math.floor(Math.random() * 100) }
    })
  }
  return { type: 'FeatureCollection', features }
}

const pointsData = generatePoints()

/** 获取颜色表达式 */
function getColorExpr() {
  if (driveMode.value === 'interpolate') {
    return ['interpolate', ['linear'], ['get', 'value'], 0, '#d4e6f1', 25, '#85c1e9', 50, '#5dade2', 75, '#2e86c1', 100, '#1a5276']
  }
  return ['step', ['get', 'value'], '#d4e6f1', 25, '#85c1e9', 50, '#5dade2', 75, '#2e86c1']
}

/** 获取半径表达式 */
function getRadiusExpr() {
  if (driveMode.value === 'interpolate') {
    return ['interpolate', ['linear'], ['get', 'value'], 0, 4, 50, 10, 100, 20]
  }
  return ['step', ['get', 'value'], 5, 33, 10, 66, 16]
}

/** 更新样式 */
function updateStyles() {
  if (!map) return

  /** 更新面图层 */
  if (map.getLayer('areas-fill')) {
    map.setPaintProperty('areas-fill', 'fill-color', getColorExpr())
  }

  /** 更新点图层 */
  if (map.getLayer('points-circle')) {
    const target = driveTarget.value
    map.setPaintProperty('points-circle', 'circle-color', (target === 'color' || target === 'both') ? getColorExpr() : '#1890ff')
    map.setPaintProperty('points-circle', 'circle-radius', (target === 'radius' || target === 'both') ? getRadiusExpr() : 8)
  }
}

watch([driveMode, driveTarget], updateStyles)

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.42, 39.90],
    zoom: 11
  })

  map.on('load', () => {
    /** 面图层 */
    map!.addSource('areas', { type: 'geojson', data: areasData })
    map!.addLayer({
      id: 'areas-fill', type: 'fill', source: 'areas',
      paint: { 'fill-color': getColorExpr() as any, 'fill-opacity': 0.6 }
    })
    map!.addLayer({
      id: 'areas-outline', type: 'line', source: 'areas',
      paint: { 'line-color': '#fff', 'line-width': 2 }
    })
    map!.addLayer({
      id: 'areas-label', type: 'symbol', source: 'areas',
      layout: { 'text-field': ['concat', ['get', 'name'], '\n', ['to-string', ['get', 'value']]], 'text-size': 12 },
      paint: { 'text-color': '#333', 'text-halo-color': '#fff', 'text-halo-width': 1.5 }
    })

    /** 点图层 */
    map!.addSource('points', { type: 'geojson', data: pointsData })
    map!.addLayer({
      id: 'points-circle', type: 'circle', source: 'points',
      paint: { 'circle-color': getColorExpr() as any, 'circle-radius': 8, 'circle-stroke-width': 1.5, 'circle-stroke-color': '#fff', 'circle-opacity': 0.85 }
    })

    /** 点击弹窗 */
    map!.on('click', 'areas-fill', (e) => {
      if (!e.features?.[0]) return
      const p = e.features[0].properties
      new maplibregl.Popup({ offset: 5, closeButton: false }).setLngLat(e.lngLat)
        .setHTML(`<b>${p?.name}</b><br/>数值: ${p?.value}<br/>人口: ${p?.population}万`).addTo(map!)
    })
    map!.on('click', 'points-circle', (e) => {
      if (!e.features?.[0]) return
      const p = e.features[0].properties
      new maplibregl.Popup({ offset: 10, closeButton: false }).setLngLat(e.lngLat)
        .setHTML(`<b>${p?.name}</b><br/>数值: ${p?.value}`).addTo(map!)
    })
  })
}

onMounted(() => initMap())
onBeforeUnmount(() => { if (map) { map.remove(); map = null } })
</script>

<template>
  <div class="lesson-page">
    <div class="control-panel">
      <h3>20. 数据驱动样式</h3>
      <p class="panel-desc">interpolate/step 映射实战</p>

      <a-divider style="margin: 12px 0" />

      <div class="section-title">映射函数</div>
      <a-radio-group v-model:value="driveMode" size="small" option-type="button">
        <a-radio-button value="interpolate">interpolate 渐变</a-radio-button>
        <a-radio-button value="step">step 分段</a-radio-button>
      </a-radio-group>

      <a-divider style="margin: 12px 0" />

      <div class="section-title">散点驱动属性</div>
      <a-radio-group v-model:value="driveTarget" size="small" option-type="button">
        <a-radio-button value="color">颜色</a-radio-button>
        <a-radio-button value="radius">大小</a-radio-button>
        <a-radio-button value="both">颜色+大小</a-radio-button>
      </a-radio-group>

      <a-divider style="margin: 12px 0" />

      <a-card size="small" :title="driveMode === 'interpolate' ? '连续渐变色阶' : '阶梯分段色阶'">
        <div v-if="driveMode === 'interpolate'">
          <div class="gradient-bar" style="background:linear-gradient(to right,#d4e6f1,#85c1e9,#5dade2,#2e86c1,#1a5276)"></div>
          <div class="gradient-labels"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
        </div>
        <div v-else>
          <div class="step-bar">
            <span style="background:#d4e6f1;flex:1"></span>
            <span style="background:#85c1e9;flex:1"></span>
            <span style="background:#5dade2;flex:1"></span>
            <span style="background:#2e86c1;flex:1"></span>
          </div>
          <div class="gradient-labels"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
        </div>
      </a-card>

      <div class="tips">
        <p>💡 interpolate 颜色平滑过渡</p>
        <p>💡 step 颜色在阈值处跳变</p>
        <p>💡 点击区域/散点查看数值</p>
      </div>
    </div>

    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style scoped>
.lesson-page { height: 100%; display: flex; }
.control-panel { width: 300px; flex-shrink: 0; background: #fff; padding: 16px; overflow-y: auto; border-right: 1px solid #e8e8e8; }
.control-panel h3 { font-size: 15px; font-weight: 600; margin: 0; }
.panel-desc { font-size: 12px; color: #999; margin: 4px 0 0; }
.section-title { font-size: 13px; font-weight: 600; color: #333; margin-bottom: 8px; }
.gradient-bar { height: 14px; border-radius: 7px; }
.gradient-labels { display: flex; justify-content: space-between; font-size: 10px; color: #999; margin-top: 2px; }
.step-bar { display: flex; height: 14px; border-radius: 7px; overflow: hidden; }
.tips { margin-top: 16px; font-size: 12px; color: #999; line-height: 1.8; }
.tips p { margin: 0; }
.map-container { flex: 1; height: 100%; }
</style>
