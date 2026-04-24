<script setup lang="ts">
/**
 * 第18课：绘制与测量
 * 演示点线面绘制和距离/面积测量
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 绘制模式 */
const drawMode = ref<'none' | 'point' | 'line' | 'polygon'>('none')
/** 绘制的点 */
const drawPoints = ref<[number, number][]>([])
/** 测量结果 */
const measurement = ref('')

/** Haversine 距离计算（米） */
function haversine(p1: [number, number], p2: [number, number]): number {
  const R = 6371000
  const toRad = (d: number) => d * Math.PI / 180
  const dLat = toRad(p2[1] - p1[1])
  const dLng = toRad(p2[0] - p1[0])
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(p1[1])) * Math.cos(toRad(p2[1])) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** 计算总距离 */
function totalDistance(pts: [number, number][]): number {
  let d = 0
  for (let i = 1; i < pts.length; i++) d += haversine(pts[i - 1], pts[i])
  return d
}

/** 计算面积（简化球面计算） */
function polygonArea(pts: [number, number][]): number {
  if (pts.length < 3) return 0
  const toRad = (d: number) => d * Math.PI / 180
  let area = 0
  const n = pts.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    area += toRad(pts[j][0] - pts[i][0]) * (2 + Math.sin(toRad(pts[i][1])) + Math.sin(toRad(pts[j][1])))
  }
  return Math.abs(area * 6371000 * 6371000 / 2)
}

/** 格式化距离 */
function formatDist(m: number): string {
  return m > 1000 ? `${(m / 1000).toFixed(2)} km` : `${m.toFixed(0)} m`
}

/** 格式化面积 */
function formatArea(m2: number): string {
  return m2 > 1e6 ? `${(m2 / 1e6).toFixed(2)} km²` : `${m2.toFixed(0)} m²`
}

/** 更新绘制图层 */
function updateDrawLayers() {
  if (!map) return
  const pts = drawPoints.value

  /** 更新点 */
  const pointSource = map.getSource('draw-points') as maplibregl.GeoJSONSource
  if (pointSource) {
    pointSource.setData({
      type: 'FeatureCollection',
      features: pts.map(p => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: p },
        properties: {}
      }))
    })
  }

  /** 更新线 */
  const lineSource = map.getSource('draw-line') as maplibregl.GeoJSONSource
  if (lineSource && pts.length >= 2) {
    lineSource.setData({
      type: 'Feature',
      geometry: { type: 'LineString', coordinates: pts },
      properties: {}
    })
  } else if (lineSource) {
    lineSource.setData({ type: 'FeatureCollection', features: [] })
  }

  /** 更新面 */
  const polySource = map.getSource('draw-polygon') as maplibregl.GeoJSONSource
  if (polySource && pts.length >= 3 && drawMode.value === 'polygon') {
    polySource.setData({
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[...pts, pts[0]]] },
      properties: {}
    })
  } else if (polySource) {
    polySource.setData({ type: 'FeatureCollection', features: [] })
  }

  /** 更新测量结果 */
  if (drawMode.value === 'line' && pts.length >= 2) {
    measurement.value = `总距离: ${formatDist(totalDistance(pts))}`
  } else if (drawMode.value === 'polygon' && pts.length >= 3) {
    measurement.value = `周长: ${formatDist(totalDistance([...pts, pts[0]]))}\n面积: ${formatArea(polygonArea(pts))}`
  } else {
    measurement.value = ''
  }
}

/** 地图点击处理 */
function handleMapClick(e: maplibregl.MapMouseEvent) {
  if (drawMode.value === 'none') return
  const pt: [number, number] = [+e.lngLat.lng.toFixed(6), +e.lngLat.lat.toFixed(6)]

  if (drawMode.value === 'point') {
    drawPoints.value = [pt]
    measurement.value = `坐标: ${pt[0]}, ${pt[1]}`
  } else {
    drawPoints.value.push(pt)
  }
  updateDrawLayers()
}

/** 切换模式 */
function setMode(mode: typeof drawMode.value) {
  drawMode.value = mode
  drawPoints.value = []
  measurement.value = ''
  updateDrawLayers()
  if (map) {
    map.getCanvas().style.cursor = mode === 'none' ? '' : 'crosshair'
  }
}

/** 撤销最后一个点 */
function undoLast() {
  drawPoints.value.pop()
  updateDrawLayers()
}

/** 清除绘制 */
function clearDraw() {
  drawPoints.value = []
  measurement.value = ''
  updateDrawLayers()
}

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.39, 39.91],
    zoom: 12
  })

  map.on('load', () => {
    /** 面图层 */
    map!.addSource('draw-polygon', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    map!.addLayer({ id: 'draw-polygon-fill', type: 'fill', source: 'draw-polygon', paint: { 'fill-color': '#1890ff', 'fill-opacity': 0.2 } })

    /** 线图层 */
    map!.addSource('draw-line', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    map!.addLayer({ id: 'draw-line-layer', type: 'line', source: 'draw-line', paint: { 'line-color': '#f5222d', 'line-width': 2, 'line-dasharray': [4, 2] }, layout: { 'line-cap': 'round' } })

    /** 点图层 */
    map!.addSource('draw-points', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
    map!.addLayer({ id: 'draw-points-layer', type: 'circle', source: 'draw-points', paint: { 'circle-radius': 5, 'circle-color': '#f5222d', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' } })
  })

  map.on('click', handleMapClick)
}

onMounted(() => initMap())
onBeforeUnmount(() => { if (map) { map.remove(); map = null } })
</script>

<template>
  <div class="lesson-page">
    <div class="control-panel">
      <h3>18. 绘制与测量</h3>
      <p class="panel-desc">点/线/面绘制与距离面积计算</p>

      <a-divider style="margin: 12px 0" />

      <div class="section-title">绘制工具</div>
      <div class="tool-bar">
        <a-button :type="drawMode === 'point' ? 'primary' : 'default'" size="small" @click="setMode('point')">📍 点</a-button>
        <a-button :type="drawMode === 'line' ? 'primary' : 'default'" size="small" @click="setMode('line')">〰️ 线</a-button>
        <a-button :type="drawMode === 'polygon' ? 'primary' : 'default'" size="small" @click="setMode('polygon')">⬡ 面</a-button>
        <a-button size="small" @click="setMode('none')">✋ 停止</a-button>
      </div>

      <div class="tool-bar" style="margin-top: 8px;">
        <a-button size="small" @click="undoLast" :disabled="drawPoints.length === 0">↩ 撤销</a-button>
        <a-button size="small" danger @click="clearDraw">🗑️ 清除</a-button>
      </div>

      <a-divider style="margin: 12px 0" />

      <a-card size="small" title="绘制信息">
        <div class="draw-info">
          <div>模式: <a-tag :color="drawMode === 'none' ? 'default' : 'blue'">{{ drawMode }}</a-tag></div>
          <div>点数: <b>{{ drawPoints.length }}</b></div>
        </div>
      </a-card>

      <!-- 测量结果 -->
      <a-card v-if="measurement" size="small" title="测量结果" style="margin-top: 12px;">
        <pre class="measure-result">{{ measurement }}</pre>
      </a-card>

      <!-- 坐标列表 -->
      <div v-if="drawPoints.length > 0" class="coord-list">
        <div class="section-title" style="margin-top: 12px;">坐标列表</div>
        <div v-for="(p, i) in drawPoints" :key="i" class="coord-item">
          {{ i + 1 }}. [{{ p[0] }}, {{ p[1] }}]
        </div>
      </div>

      <div class="tips">
        <p>💡 点击地图添加点</p>
        <p>💡 线模式自动计算距离</p>
        <p>💡 面模式计算周长和面积</p>
        <p>💡 使用 Haversine 公式</p>
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
.tool-bar { display: flex; gap: 6px; flex-wrap: wrap; }
.draw-info { font-size: 13px; line-height: 2; }
.measure-result { font-size: 13px; color: #1890ff; font-weight: 500; margin: 0; white-space: pre-line; }
.coord-list { max-height: 150px; overflow-y: auto; }
.coord-item { font-size: 11px; color: #666; font-family: monospace; line-height: 1.8; }
.tips { margin-top: 16px; font-size: 12px; color: #999; line-height: 1.8; }
.tips p { margin: 0; }
.map-container { flex: 1; height: 100%; }
</style>
