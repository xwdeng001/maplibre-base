<script setup lang="ts">
/**
 * 第17课：要素交互
 * 演示 queryRenderedFeatures、悬停高亮、setFeatureState
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 当前悬停要素信息 */
const hoveredInfo = ref<Record<string, unknown> | null>(null)
const clickedInfo = ref<Record<string, unknown> | null>(null)
let hoveredId: number | string | null = null

/** 区域数据 */
const areasData: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', id: 1, geometry: { type: 'Polygon', coordinates: [[[116.33, 39.96], [116.42, 39.96], [116.42, 39.90], [116.33, 39.90], [116.33, 39.96]]] }, properties: { name: '西城区', value: 85, category: 'A' } },
    { type: 'Feature', id: 2, geometry: { type: 'Polygon', coordinates: [[[116.42, 39.96], [116.48, 39.96], [116.48, 39.90], [116.42, 39.90], [116.42, 39.96]]] }, properties: { name: '东城区', value: 72, category: 'B' } },
    { type: 'Feature', id: 3, geometry: { type: 'Polygon', coordinates: [[[116.25, 39.96], [116.33, 39.96], [116.33, 39.87], [116.25, 39.87], [116.25, 39.96]]] }, properties: { name: '海淀区', value: 93, category: 'A' } },
    { type: 'Feature', id: 4, geometry: { type: 'Polygon', coordinates: [[[116.48, 39.96], [116.56, 39.96], [116.56, 39.87], [116.48, 39.87], [116.48, 39.96]]] }, properties: { name: '朝阳区', value: 67, category: 'B' } },
    { type: 'Feature', id: 5, geometry: { type: 'Polygon', coordinates: [[[116.33, 39.90], [116.48, 39.90], [116.48, 39.84], [116.33, 39.84], [116.33, 39.90]]] }, properties: { name: '丰台区', value: 54, category: 'C' } },
    { type: 'Feature', id: 6, geometry: { type: 'Polygon', coordinates: [[[116.25, 39.87], [116.33, 39.87], [116.33, 39.80], [116.25, 39.80], [116.25, 39.87]]] }, properties: { name: '石景山区', value: 41, category: 'C' } }
  ]
}

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.39, 39.91],
    zoom: 11
  })

  map.on('load', () => {
    map!.addSource('areas', { type: 'geojson', data: areasData })

    /** 填充图层 — 使用 feature-state 控制颜色 */
    map!.addLayer({
      id: 'areas-fill',
      type: 'fill',
      source: 'areas',
      paint: {
        'fill-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#faad14',
          '#1890ff'
        ],
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          0.6,
          0.3
        ]
      }
    })

    /** 边框图层 */
    map!.addLayer({
      id: 'areas-outline',
      type: 'line',
      source: 'areas',
      paint: {
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#fa8c16',
          '#1890ff'
        ],
        'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 3, 1.5]
      }
    })

    /** 标注 */
    map!.addLayer({
      id: 'areas-label',
      type: 'symbol',
      source: 'areas',
      layout: { 'text-field': ['get', 'name'], 'text-size': 13 },
      paint: { 'text-color': '#333', 'text-halo-color': '#fff', 'text-halo-width': 1.5 }
    })

    /** 悬停高亮 */
    map!.on('mousemove', 'areas-fill', (e) => {
      if (!e.features?.length) return
      map!.getCanvas().style.cursor = 'pointer'

      /** 清除之前的高亮 */
      if (hoveredId !== null) {
        map!.setFeatureState({ source: 'areas', id: hoveredId }, { hover: false })
      }

      hoveredId = e.features[0].id ?? null
      if (hoveredId !== null) {
        map!.setFeatureState({ source: 'areas', id: hoveredId }, { hover: true })
      }

      hoveredInfo.value = e.features[0].properties as Record<string, unknown>
    })

    map!.on('mouseleave', 'areas-fill', () => {
      map!.getCanvas().style.cursor = ''
      if (hoveredId !== null) {
        map!.setFeatureState({ source: 'areas', id: hoveredId }, { hover: false })
        hoveredId = null
      }
      hoveredInfo.value = null
    })

    /** 点击查询 */
    map!.on('click', 'areas-fill', (e) => {
      if (!e.features?.length) return
      clickedInfo.value = e.features[0].properties as Record<string, unknown>

      new maplibregl.Popup({ offset: 5, closeButton: false })
        .setLngLat(e.lngLat)
        .setHTML(`<b>${clickedInfo.value.name}</b><br/>数值: ${clickedInfo.value.value}<br/>类别: ${clickedInfo.value.category}`)
        .addTo(map!)
    })
  })
}

onMounted(() => initMap())
onBeforeUnmount(() => { if (map) { map.remove(); map = null } })
</script>

<template>
  <div class="lesson-page">
    <div class="control-panel">
      <h3>17. 要素交互</h3>
      <p class="panel-desc">悬停高亮、点击查询、FeatureState</p>

      <a-divider style="margin: 12px 0" />

      <!-- 悬停信息 -->
      <a-card size="small" title="悬停要素" style="margin-bottom: 12px;">
        <div v-if="hoveredInfo" class="info-content">
          <div>名称: <b>{{ hoveredInfo.name }}</b></div>
          <div>数值: <b>{{ hoveredInfo.value }}</b></div>
          <div>类别: <a-tag>{{ hoveredInfo.category }}</a-tag></div>
        </div>
        <div v-else style="font-size: 12px; color: #999;">悬停区域查看信息...</div>
      </a-card>

      <!-- 点击信息 -->
      <a-card size="small" title="点击要素">
        <div v-if="clickedInfo" class="info-content">
          <div>名称: <b>{{ clickedInfo.name }}</b></div>
          <div>数值: <b>{{ clickedInfo.value }}</b></div>
          <div>类别: <a-tag>{{ clickedInfo.category }}</a-tag></div>
        </div>
        <div v-else style="font-size: 12px; color: #999;">点击区域查看详情...</div>
      </a-card>

      <a-divider style="margin: 12px 0" />

      <a-card size="small" title="核心 API">
        <div class="api-list">
          <div><code>queryRenderedFeatures</code></div>
          <div><code>setFeatureState</code></div>
          <div><code>feature-state 表达式</code></div>
        </div>
      </a-card>

      <div class="tips">
        <p>💡 悬停使用 setFeatureState 高亮</p>
        <p>💡 高亮不修改数据源，性能高</p>
        <p>💡 要素需要 id 才能使用 featureState</p>
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
.info-content { font-size: 13px; line-height: 2; }
.api-list { font-size: 12px; line-height: 2; }
.api-list code { background: #f5f5f5; padding: 1px 6px; border-radius: 3px; color: #d4380d; }
.tips { margin-top: 16px; font-size: 12px; color: #999; line-height: 1.8; }
.tips p { margin: 0; }
.map-container { flex: 1; height: 100%; }
</style>
