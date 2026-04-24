<script setup lang="ts">
/**
 * 第14课：Fill-extrusion 3D 建筑图层
 * 演示3D拉伸效果和参数调节
 */
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 3D 属性控制 */
const extProps = reactive({
  opacity: 0.85,
  colorMode: 'height' as 'fixed' | 'height',
  fixedColor: '#5dade2',
  verticalGradient: true
})

/** 模拟建筑数据 */
function generateBuildings(): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = []
  const baseX = 116.38, baseY = 39.90
  const gridSize = 8

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = baseX + i * 0.003
      const y = baseY + j * 0.002
      const size = 0.0008 + Math.random() * 0.0008
      /** 中心区域建筑更高 */
      const distFromCenter = Math.sqrt(Math.pow(i - gridSize / 2, 2) + Math.pow(j - gridSize / 2, 2))
      const height = Math.max(10, Math.floor(180 - distFromCenter * 25 + Math.random() * 60))

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[x, y], [x + size, y], [x + size, y + size * 0.8], [x, y + size * 0.8], [x, y]]]
        },
        properties: { name: `建筑${i * gridSize + j + 1}`, height, floors: Math.floor(height / 3) }
      })
    }
  }
  return { type: 'FeatureCollection', features }
}

const buildingData = generateBuildings()

/** 更新样式 */
watch(extProps, (props) => {
  if (!map?.getLayer('buildings-3d')) return
  map.setPaintProperty('buildings-3d', 'fill-extrusion-opacity', props.opacity)
  map.setPaintProperty('buildings-3d', 'fill-extrusion-vertical-gradient', props.verticalGradient)

  if (props.colorMode === 'fixed') {
    map.setPaintProperty('buildings-3d', 'fill-extrusion-color', props.fixedColor)
  } else {
    map.setPaintProperty('buildings-3d', 'fill-extrusion-color', [
      'interpolate', ['linear'], ['get', 'height'],
      10, '#d4e6f1', 50, '#85c1e9', 100, '#5dade2', 150, '#2e86c1', 200, '#1a5276'
    ])
  }
}, { deep: true })

/** 重置视角 */
function reset3DView() {
  map?.flyTo({ center: [116.395, 39.908], zoom: 14.5, pitch: 55, bearing: -30, duration: 1500 })
}

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.395, 39.908],
    zoom: 14.5,
    pitch: 55,
    bearing: -30
  })

  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')

  map.on('load', () => {
    map!.addSource('buildings', { type: 'geojson', data: buildingData })

    map!.addLayer({
      id: 'buildings-3d',
      type: 'fill-extrusion',
      source: 'buildings',
      paint: {
        'fill-extrusion-color': [
          'interpolate', ['linear'], ['get', 'height'],
          10, '#d4e6f1', 50, '#85c1e9', 100, '#5dade2', 150, '#2e86c1', 200, '#1a5276'
        ],
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': 0,
        'fill-extrusion-opacity': extProps.opacity,
        'fill-extrusion-vertical-gradient': true
      }
    })

    /** 点击弹窗 */
    map!.on('click', 'buildings-3d', (e) => {
      if (!e.features?.[0]) return
      const p = e.features[0].properties
      new maplibregl.Popup({ offset: 10, closeButton: false })
        .setLngLat(e.lngLat)
        .setHTML(`<b>${p?.name}</b><br/>高度: ${p?.height}m<br/>楼层: ${p?.floors}F`)
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
      <h3>14. Fill-extrusion 3D 建筑</h3>
      <p class="panel-desc">3D 拉伸效果与建筑可视化</p>

      <a-divider style="margin: 12px 0" />

      <div class="section-title">颜色模式</div>
      <a-radio-group v-model:value="extProps.colorMode" size="small" option-type="button">
        <a-radio-button value="height">按高度</a-radio-button>
        <a-radio-button value="fixed">固定色</a-radio-button>
      </a-radio-group>

      <a-divider style="margin: 12px 0" />

      <div class="control-row">
        <span class="label">opacity</span>
        <a-slider v-model:value="extProps.opacity" :min="0.1" :max="1" :step="0.05" style="width: 120px" />
        <span class="value">{{ extProps.opacity }}</span>
      </div>

      <div class="control-row">
        <span class="label">垂直渐变</span>
        <a-switch v-model:checked="extProps.verticalGradient" size="small" />
      </div>

      <a-button type="primary" size="small" block @click="reset3DView" style="margin-top: 8px;">重置 3D 视角</a-button>

      <a-divider style="margin: 12px 0" />

      <a-card size="small" title="高度色阶" v-if="extProps.colorMode === 'height'">
        <div class="height-legend">
          <div class="h-item"><span class="h-color" style="background:#d4e6f1"></span> &lt;50m</div>
          <div class="h-item"><span class="h-color" style="background:#85c1e9"></span> 50~100m</div>
          <div class="h-item"><span class="h-color" style="background:#5dade2"></span> 100~150m</div>
          <div class="h-item"><span class="h-color" style="background:#2e86c1"></span> 150~200m</div>
          <div class="h-item"><span class="h-color" style="background:#1a5276"></span> &gt;200m</div>
        </div>
      </a-card>

      <div class="tips">
        <p>💡 右键拖拽旋转/倾斜视角</p>
        <p>💡 点击建筑查看高度信息</p>
        <p>💡 height/base 控制拉伸范围</p>
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
.control-row .label { font-size: 13px; color: #555; min-width: 90px; }
.control-row .value { font-size: 13px; color: #1890ff; font-weight: 500; }
.height-legend { font-size: 12px; }
.h-item { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.h-color { width: 20px; height: 14px; border-radius: 2px; border: 1px solid #ddd; }
.tips { margin-top: 16px; font-size: 12px; color: #999; line-height: 1.8; }
.tips p { margin: 0; }
.map-container { flex: 1; height: 100%; }
</style>
