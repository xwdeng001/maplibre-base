<script setup lang="ts">
/**
 * 第13课：Heatmap 热力图层
 * 演示热力图渲染和参数调节
 */
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 热力图参数 */
const heatProps = reactive({
  radius: 25,
  intensity: 1,
  opacity: 0.8,
  maxZoom: 15
})

/** 生成模拟热力点数据 */
function generateHeatPoints(): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = []
  /** 热点区域中心 */
  const hotspots = [
    { center: [116.39, 39.91], spread: 0.02, count: 80 },
    { center: [116.42, 39.93], spread: 0.015, count: 50 },
    { center: [116.35, 39.88], spread: 0.02, count: 40 },
    { center: [116.46, 39.90], spread: 0.025, count: 60 },
    { center: [116.32, 39.93], spread: 0.018, count: 35 },
    { center: [116.40, 39.86], spread: 0.02, count: 45 }
  ]

  hotspots.forEach(spot => {
    for (let i = 0; i < spot.count; i++) {
      const lng = spot.center[0] + (Math.random() - 0.5) * spot.spread * 2
      const lat = spot.center[1] + (Math.random() - 0.5) * spot.spread * 2
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: { weight: Math.random() * 0.8 + 0.2 }
      })
    }
  })

  /** 随机散点 */
  for (let i = 0; i < 100; i++) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [116.25 + Math.random() * 0.3, 39.82 + Math.random() * 0.16]
      },
      properties: { weight: Math.random() * 0.5 }
    })
  }

  return { type: 'FeatureCollection', features }
}

const heatData = generateHeatPoints()
const pointCount = heatData.features.length

/** 更新热力图参数 */
watch(heatProps, (props) => {
  if (!map?.getLayer('heat-layer')) return
  map.setPaintProperty('heat-layer', 'heatmap-radius', props.radius)
  map.setPaintProperty('heat-layer', 'heatmap-intensity', props.intensity)
  map.setPaintProperty('heat-layer', 'heatmap-opacity', props.opacity)
}, { deep: true })

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.39, 39.91],
    zoom: 11
  })

  map.on('load', () => {
    map!.addSource('heat-source', { type: 'geojson', data: heatData })

    map!.addLayer({
      id: 'heat-layer',
      type: 'heatmap',
      source: 'heat-source',
      paint: {
        'heatmap-weight': ['get', 'weight'],
        'heatmap-radius': heatProps.radius,
        'heatmap-intensity': heatProps.intensity,
        'heatmap-opacity': heatProps.opacity,
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(33,102,172,0)',
          0.2, 'rgb(103,169,207)',
          0.4, 'rgb(209,229,240)',
          0.6, 'rgb(253,219,199)',
          0.8, 'rgb(239,138,98)',
          1, 'rgb(178,24,43)'
        ]
      }
    })
  })
}

onMounted(() => initMap())
onBeforeUnmount(() => { if (map) { map.remove(); map = null } })
</script>

<template>
  <div class="lesson-page">
    <div class="control-panel">
      <h3>13. Heatmap 热力图层</h3>
      <p class="panel-desc">密度可视化与参数调节</p>

      <a-divider style="margin: 12px 0" />

      <a-card size="small" title="数据信息" style="margin-bottom: 12px;">
        <div style="font-size: 12px;">数据点数量：<b>{{ pointCount }}</b></div>
      </a-card>

      <div class="control-row">
        <span class="label">heatmap-radius</span>
        <a-slider v-model:value="heatProps.radius" :min="5" :max="50" style="width: 110px" />
        <span class="value">{{ heatProps.radius }}</span>
      </div>

      <div class="control-row">
        <span class="label">heatmap-intensity</span>
        <a-slider v-model:value="heatProps.intensity" :min="0.1" :max="3" :step="0.1" style="width: 110px" />
        <span class="value">{{ heatProps.intensity }}</span>
      </div>

      <div class="control-row">
        <span class="label">heatmap-opacity</span>
        <a-slider v-model:value="heatProps.opacity" :min="0" :max="1" :step="0.05" style="width: 110px" />
        <span class="value">{{ heatProps.opacity }}</span>
      </div>

      <a-divider style="margin: 12px 0" />

      <!-- 颜色图例 -->
      <div class="section-title">heatmap-color 图例</div>
      <div class="heat-legend">
        <div class="heat-bar"></div>
        <div class="heat-labels"><span>低密度</span><span>高密度</span></div>
      </div>

      <div class="tips">
        <p>💡 radius 控制每个点的影响范围</p>
        <p>💡 intensity 控制整体热力强度</p>
        <p>💡 heatmap-weight 支持数据驱动权重</p>
        <p>💡 热点区域使用高斯分布模拟</p>
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
.control-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.control-row .label { font-size: 13px; color: #555; min-width: 120px; }
.control-row .value { font-size: 13px; color: #1890ff; font-weight: 500; }
.heat-legend { margin-bottom: 12px; }
.heat-bar { height: 14px; border-radius: 7px; background: linear-gradient(to right, rgba(33,102,172,0.3), rgb(103,169,207), rgb(209,229,240), rgb(253,219,199), rgb(239,138,98), rgb(178,24,43)); }
.heat-labels { display: flex; justify-content: space-between; font-size: 10px; color: #999; margin-top: 2px; }
.tips { margin-top: 16px; font-size: 12px; color: #999; line-height: 1.8; }
.tips p { margin: 0; }
.map-container { flex: 1; height: 100%; }
</style>
