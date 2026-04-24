<script setup lang="ts">
/**
 * 第22课：运行时样式修改
 * 演示 setPaintProperty/setLayoutProperty/setFilter/moveLayer/addLayer/removeLayer
 */
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 图层状态 */
const layers = reactive({
  fill: { visible: true, color: '#1890ff', opacity: 0.4 },
  outline: { visible: true, color: '#0050b3', width: 2 },
  circle: { visible: true, color: '#f5222d', radius: 6 },
  label: { visible: true, size: 12 }
})

/** 操作日志 */
const logs = ref<string[]>([])
function log(msg: string) {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
  if (logs.value.length > 15) logs.value.pop()
}

/** 区域数据 */
const areasData: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', id: 1, geometry: { type: 'Polygon', coordinates: [[[116.33, 39.96], [116.42, 39.96], [116.42, 39.90], [116.33, 39.90], [116.33, 39.96]]] }, properties: { name: '区域A', value: 85 } },
    { type: 'Feature', id: 2, geometry: { type: 'Polygon', coordinates: [[[116.42, 39.96], [116.50, 39.96], [116.50, 39.90], [116.42, 39.90], [116.42, 39.96]]] }, properties: { name: '区域B', value: 42 } },
    { type: 'Feature', id: 3, geometry: { type: 'Polygon', coordinates: [[[116.33, 39.90], [116.42, 39.90], [116.42, 39.84], [116.33, 39.84], [116.33, 39.90]]] }, properties: { name: '区域C', value: 67 } },
    { type: 'Feature', id: 4, geometry: { type: 'Polygon', coordinates: [[[116.42, 39.90], [116.50, 39.90], [116.50, 39.84], [116.42, 39.84], [116.42, 39.90]]] }, properties: { name: '区域D', value: 93 } }
  ]
}

/** 点数据 */
const pointsData: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.375, 39.93] }, properties: { name: 'P1' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.46, 39.93] }, properties: { name: 'P2' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.375, 39.87] }, properties: { name: 'P3' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.46, 39.87] }, properties: { name: 'P4' } }
  ]
}

/** 修改 Paint 属性 */
function setFillColor(color: string) {
  if (!map?.getLayer('rt-fill')) return
  layers.fill.color = color
  map.setPaintProperty('rt-fill', 'fill-color', color)
  log(`setPaintProperty fill-color → ${color}`)
}

function setFillOpacity(val: number) {
  if (!map?.getLayer('rt-fill')) return
  layers.fill.opacity = val
  map.setPaintProperty('rt-fill', 'fill-opacity', val)
  log(`setPaintProperty fill-opacity → ${val}`)
}

function setCircleRadius(val: number) {
  if (!map?.getLayer('rt-circle')) return
  layers.circle.radius = val
  map.setPaintProperty('rt-circle', 'circle-radius', val)
  log(`setPaintProperty circle-radius → ${val}`)
}

function setLabelSize(val: number) {
  if (!map?.getLayer('rt-label')) return
  layers.label.size = val
  map.setLayoutProperty('rt-label', 'text-size', val)
  log(`setLayoutProperty text-size → ${val}`)
}

/** 切换图层可见性 */
function toggleLayer(layerId: string, key: keyof typeof layers) {
  if (!map?.getLayer(layerId)) return
  const item = layers[key] as { visible: boolean }
  item.visible = !item.visible
  map.setLayoutProperty(layerId, 'visibility', item.visible ? 'visible' : 'none')
  log(`setLayoutProperty ${layerId} visibility → ${item.visible ? 'visible' : 'none'}`)
}

/** 图层排序 */
function moveCircleToTop() {
  if (!map?.getLayer('rt-circle')) return
  map.moveLayer('rt-circle')
  log('moveLayer rt-circle → top')
}

function moveCircleBelow() {
  if (!map?.getLayer('rt-circle') || !map?.getLayer('rt-fill')) return
  map.moveLayer('rt-circle', 'rt-fill')
  log('moveLayer rt-circle → below rt-fill')
}

const colorPresets = ['#1890ff', '#f5222d', '#52c41a', '#722ed1', '#fa8c16', '#13c2c2']

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.415, 39.90],
    zoom: 12
  })

  map.on('load', () => {
    map!.addSource('rt-areas', { type: 'geojson', data: areasData })
    map!.addSource('rt-points', { type: 'geojson', data: pointsData })

    map!.addLayer({ id: 'rt-fill', type: 'fill', source: 'rt-areas', paint: { 'fill-color': layers.fill.color, 'fill-opacity': layers.fill.opacity } })
    map!.addLayer({ id: 'rt-outline', type: 'line', source: 'rt-areas', paint: { 'line-color': layers.outline.color, 'line-width': layers.outline.width } })
    map!.addLayer({ id: 'rt-circle', type: 'circle', source: 'rt-points', paint: { 'circle-radius': layers.circle.radius, 'circle-color': layers.circle.color, 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } })
    map!.addLayer({ id: 'rt-label', type: 'symbol', source: 'rt-areas', layout: { 'text-field': ['get', 'name'], 'text-size': layers.label.size }, paint: { 'text-color': '#333', 'text-halo-color': '#fff', 'text-halo-width': 1.5 } })

    log('初始图层加载完成')
  })
}

onMounted(() => initMap())
onBeforeUnmount(() => { if (map) { map.remove(); map = null } })
</script>

<template>
  <div class="lesson-page">
    <div class="control-panel">
      <h3>22. 运行时样式修改</h3>
      <p class="panel-desc">Paint/Layout/Filter/图层管理</p>

      <a-divider style="margin: 12px 0" />

      <!-- Fill 颜色 -->
      <div class="section-title">fill-color</div>
      <div class="color-presets">
        <span v-for="c in colorPresets" :key="c" class="color-dot"
          :style="{ background: c, outline: layers.fill.color === c ? '2px solid #333' : 'none' }"
          @click="setFillColor(c)"></span>
      </div>

      <!-- Fill 透明度 -->
      <div class="control-row">
        <span class="label">fill-opacity</span>
        <a-slider :value="layers.fill.opacity" :min="0" :max="1" :step="0.05" @change="setFillOpacity" style="width: 120px" />
        <span class="value">{{ layers.fill.opacity }}</span>
      </div>

      <!-- Circle 半径 -->
      <div class="control-row">
        <span class="label">circle-radius</span>
        <a-slider :value="layers.circle.radius" :min="3" :max="20" @change="setCircleRadius" style="width: 120px" />
        <span class="value">{{ layers.circle.radius }}</span>
      </div>

      <!-- Label 字号 -->
      <div class="control-row">
        <span class="label">text-size</span>
        <a-slider :value="layers.label.size" :min="8" :max="24" @change="setLabelSize" style="width: 120px" />
        <span class="value">{{ layers.label.size }}</span>
      </div>

      <a-divider style="margin: 12px 0" />

      <!-- 可见性 -->
      <div class="section-title">图层可见性</div>
      <div class="vis-row"><span>填充</span><a-switch :checked="layers.fill.visible" size="small" @change="toggleLayer('rt-fill', 'fill')" /></div>
      <div class="vis-row"><span>边框</span><a-switch :checked="layers.outline.visible" size="small" @change="toggleLayer('rt-outline', 'outline')" /></div>
      <div class="vis-row"><span>圆点</span><a-switch :checked="layers.circle.visible" size="small" @change="toggleLayer('rt-circle', 'circle')" /></div>
      <div class="vis-row"><span>标注</span><a-switch :checked="layers.label.visible" size="small" @change="toggleLayer('rt-label', 'label')" /></div>

      <a-divider style="margin: 12px 0" />

      <!-- 图层排序 -->
      <div class="section-title">图层排序</div>
      <div style="display: flex; gap: 6px;">
        <a-button size="small" @click="moveCircleToTop">圆点置顶</a-button>
        <a-button size="small" @click="moveCircleBelow">圆点置底</a-button>
      </div>

      <a-divider style="margin: 12px 0" />

      <!-- 操作日志 -->
      <div class="section-title">操作日志</div>
      <div class="log-box">
        <div v-for="(l, i) in logs" :key="i" class="log-item">{{ l }}</div>
      </div>
    </div>

    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style scoped>
.lesson-page { height: 100%; display: flex; }
.control-panel { width: 320px; flex-shrink: 0; background: #fff; padding: 16px; overflow-y: auto; border-right: 1px solid #e8e8e8; }
.control-panel h3 { font-size: 15px; font-weight: 600; margin: 0; }
.panel-desc { font-size: 12px; color: #999; margin: 4px 0 0; }
.section-title { font-size: 13px; font-weight: 600; color: #333; margin-bottom: 8px; }
.color-presets { display: flex; gap: 8px; margin-bottom: 12px; }
.color-dot { width: 24px; height: 24px; border-radius: 50%; cursor: pointer; outline-offset: 3px; transition: all .2s; }
.control-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.control-row .label { font-size: 13px; color: #555; min-width: 90px; }
.control-row .value { font-size: 13px; color: #1890ff; font-weight: 500; }
.vis-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
.log-box { max-height: 150px; overflow-y: auto; font-size: 11px; font-family: monospace; background: #fafafa; border: 1px solid #e8e8e8; border-radius: 4px; padding: 6px; }
.log-item { color: #666; line-height: 1.6; border-bottom: 1px solid #f0f0f0; padding: 2px 0; }
.map-container { flex: 1; height: 100%; }
</style>
