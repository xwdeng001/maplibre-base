<script setup lang="ts">
/**
 * 第06课：数据源（Sources）
 * 演示六种数据源类型的添加与管理
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'
import overlayImageUrl from '@/assets/7.jpg'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 数据源开关状态 */
const sources = ref([
  {
    key: 'geojson-points',
    name: 'GeoJSON 数据源',
    type: 'geojson',
    desc: '自定义点要素数据',
    enabled: false
  },
  {
    key: 'geojson-polygon',
    name: 'GeoJSON 多边形',
    type: 'geojson',
    desc: '北京六环区域多边形',
    enabled: false
  },
  {
    key: 'geojson-line',
    name: 'GeoJSON 线要素',
    type: 'geojson',
    desc: '长安街路线',
    enabled: false
  },
  {
    key: 'image-overlay',
    name: 'Image 图片源',
    type: 'image',
    desc: '本地图片覆盖在地理范围',
    enabled: false
  }
])

/** image 源四角坐标 [左上, 右上, 右下, 左下] — 天安门广场附近 */
const imageOverlayCoordinates: [
  [number, number],
  [number, number],
  [number, number],
  [number, number]
] = [
    [116.385, 39.915],
    [116.405, 39.915],
    [116.405, 39.898],
    [116.385, 39.898]
  ]

/** 示例 GeoJSON 数据 — 点 */
const pointsData: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.3912, 39.9073] }, properties: { name: '天安门', icon: '🏛️' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.3974, 39.9163] }, properties: { name: '故宫', icon: '🏯' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.3913, 39.9340] }, properties: { name: '鼓楼', icon: '🏗️' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.4074, 39.8887] }, properties: { name: '天坛', icon: '⛩️' } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.2731, 39.9998] }, properties: { name: '颐和园', icon: '🌳' } }
  ]
}

/** 示例 GeoJSON 数据 — 多边形（北京中心区域） */
const polygonData: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [116.33, 39.95], [116.45, 39.95], [116.45, 39.87],
          [116.33, 39.87], [116.33, 39.95]
        ]]
      },
      properties: { name: '北京中心区域' }
    }
  ]
}

/** 示例 GeoJSON 数据 — 线 */
const lineData: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [116.3280, 39.9075], [116.3580, 39.9075], [116.3912, 39.9073],
          [116.4200, 39.9073], [116.4500, 39.9073]
        ]
      },
      properties: { name: '长安街' }
    }
  ]
}

/** 添加 GeoJSON 点数据源 + 图层 */
function addPointSource() {
  if (!map || map.getSource('geojson-points')) return
  map.addSource('geojson-points', { type: 'geojson', data: pointsData })
  map.addLayer({
    id: 'geojson-points-layer',
    type: 'circle',
    source: 'geojson-points',
    paint: {
      'circle-radius': 8,
      'circle-color': '#1890ff',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }
  })
  /** 添加文字标注图层 */
  map.addLayer({
    id: 'geojson-points-label',
    type: 'symbol',
    source: 'geojson-points',
    layout: {
      'text-field': ['get', 'name'],
      'text-size': 12,
      'text-offset': [0, 1.5],
      'text-anchor': 'top'
    },
    paint: {
      'text-color': '#333',
      'text-halo-color': '#fff',
      'text-halo-width': 1
    }
  })
}

/** 移除 GeoJSON 点数据源 + 图层 */
function removePointSource() {
  if (!map) return
  if (map.getLayer('geojson-points-label')) map.removeLayer('geojson-points-label')
  if (map.getLayer('geojson-points-layer')) map.removeLayer('geojson-points-layer')
  if (map.getSource('geojson-points')) map.removeSource('geojson-points')
}

/** 添加多边形数据源 + 图层 */
function addPolygonSource() {
  if (!map || map.getSource('geojson-polygon')) return
  map.addSource('geojson-polygon', { type: 'geojson', data: polygonData })
  map.addLayer({
    id: 'geojson-polygon-fill',
    type: 'fill',
    source: 'geojson-polygon',
    paint: {
      'fill-color': '#1890ff',
      'fill-opacity': 0.2
    }
  })
  map.addLayer({
    id: 'geojson-polygon-outline',
    type: 'line',
    source: 'geojson-polygon',
    paint: {
      'line-color': '#1890ff',
      'line-width': 2,
      'line-dasharray': [4, 2]
    }
  })
}

/** 移除多边形数据源 + 图层 */
function removePolygonSource() {
  if (!map) return
  if (map.getLayer('geojson-polygon-outline')) map.removeLayer('geojson-polygon-outline')
  if (map.getLayer('geojson-polygon-fill')) map.removeLayer('geojson-polygon-fill')
  if (map.getSource('geojson-polygon')) map.removeSource('geojson-polygon')
}

/** 添加线数据源 + 图层 */
function addLineSource() {
  if (!map || map.getSource('geojson-line')) return
  map.addSource('geojson-line', { type: 'geojson', data: lineData })
  map.addLayer({
    id: 'geojson-line-layer',
    type: 'line',
    source: 'geojson-line',
    paint: {
      'line-color': '#f5222d',
      'line-width': 4
    },
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    }
  })
}

/** 移除线数据源 + 图层 */
function removeLineSource() {
  if (!map) return
  if (map.getLayer('geojson-line-layer')) map.removeLayer('geojson-line-layer')
  if (map.getSource('geojson-line')) map.removeSource('geojson-line')
}

/** 添加 image 图片数据源 + 图层 */
function addImageSource() {
  if (!map || map.getSource('image-overlay')) return
  map.addSource('image-overlay', {
    type: 'image',
    url: overlayImageUrl,
    coordinates: imageOverlayCoordinates
  })
  map.addLayer({
    id: 'image-overlay-layer',
    type: 'raster',
    source: 'image-overlay',
    paint: {
      'raster-opacity': 0.92,
      'raster-fade-duration': 0
    }
  })
  map.flyTo({
    center: [116.395, 39.9065],
    zoom: 13,
    duration: 800
  })
}

/** 移除 image 图片数据源 + 图层 */
function removeImageSource() {
  if (!map) return
  if (map.getLayer('image-overlay-layer')) map.removeLayer('image-overlay-layer')
  if (map.getSource('image-overlay')) map.removeSource('image-overlay')
}

/** 切换数据源 */
function toggleSource(item: typeof sources.value[0]) {
  const actions: Record<string, { add: () => void; remove: () => void }> = {
    'geojson-points': { add: addPointSource, remove: removePointSource },
    'geojson-polygon': { add: addPolygonSource, remove: removePolygonSource },
    'geojson-line': { add: addLineSource, remove: removeLineSource },
    'image-overlay': { add: addImageSource, remove: removeImageSource }
  }
  const action = actions[item.key]
  if (action) {
    item.enabled ? action.add() : action.remove()
  }
}

/** 数据源类型说明 */
const sourceTypes = [
  { type: 'vector', desc: '矢量瓦片 / MVT（PBF），客户端渲染', color: '#1890ff' },
  { type: 'raster', desc: '栅格瓦片（PNG/JPEG），服务端渲染', color: '#52c41a' },
  { type: 'raster-dem', desc: '高程瓦片，用于 3D 地形', color: '#722ed1' },
  { type: 'geojson', desc: 'GeoJSON 对象，最灵活', color: '#fa8c16' },
  { type: 'image', desc: '图片覆盖在地理范围', color: '#eb2f96' },
  { type: 'video', desc: '视频覆盖在地理范围', color: '#13c2c2' }
]

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.39, 39.91],
    zoom: 11
  })
}

onMounted(() => initMap())
onBeforeUnmount(() => {
  if (map) { map.remove(); map = null }
})
</script>

<template>
  <div class="lesson-page">
    <!-- 控制面板 -->
    <div class="control-panel">
      <h3>06. 数据源（Sources）</h3>
      <p class="panel-desc">六种数据源类型与动态管理</p>

      <a-divider style="margin: 12px 0" />

      <!-- 数据源类型一览 -->
      <div class="section-title">数据源类型一览</div>
      <div class="type-list">
        <div v-for="t in sourceTypes" :key="t.type" class="type-item">
          <a-tag :color="t.color" style="font-size: 11px; min-width: 80px; text-align: center;">{{ t.type }}</a-tag>
          <span class="type-desc">{{ t.desc }}</span>
        </div>
      </div>

      <a-card size="small" title="MVT 与 vector" style="margin-top: 10px">
        <div class="mvt-note">
          <p><b>MVT</b>（Mapbox Vector Tile）是矢量瓦片的格式规范，文件多为 <code>.pbf</code> / <code>.mvt</code>。</p>
          <p>API 里没有 <code>type: 'mvt'</code>，加载 MVT 请用 <code>type: 'vector'</code>，图层需指定 <code>source-layer</code>。</p>
        </div>
      </a-card>

      <a-divider style="margin: 12px 0" />

      <!-- 数据源演示 -->
      <div class="section-title">数据源演示</div>
      <div v-for="item in sources" :key="item.key" class="source-row">
        <div class="source-info">
          <div class="source-info-head">
            <span class="source-name">{{ item.name }}</span>
            <a-tag v-if="item.type === 'image'" color="magenta"
              style="font-size: 10px; line-height: 18px; margin: 0">image</a-tag>
          </div>
          <div class="source-desc">{{ item.desc }}</div>
        </div>
        <a-switch v-model:checked="item.enabled" size="small" @change="toggleSource(item)" />
      </div>

      <a-card size="small" title="Image 源：7.jpg" style="margin-top: 12px">
        <img :src="overlayImageUrl" alt="图片源示例" class="overlay-preview" />
        <p class="image-coords-hint">
          打开上方「Image 图片源」后，图片按四角坐标贴到地图上（左上 → 右上 → 右下 → 左下）。
        </p>
      </a-card>

      <a-divider style="margin: 12px 0" />

      <!-- 瓦片 URL 说明 -->
      <a-card size="small" title="瓦片 URL 模板">
        <div class="url-template">
          <code>https://.../{z}/{x}/{y}.png</code>
        </div>
        <div class="url-explain">
          <div><b>{z}</b> — 缩放级别</div>
          <div><b>{x}</b> — 瓦片列号</div>
          <div><b>{y}</b> — 瓦片行号</div>
        </div>
      </a-card>

      <div class="tips">
        <p>💡 先移除关联图层，再移除数据源</p>
        <p>💡 GeoJSON 支持 setData 动态更新</p>
        <p>💡 vector/raster 通过瓦片 URL 加载</p>
      </div>
    </div>

    <!-- 地图 -->
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style scoped>
.lesson-page {
  height: 100%;
  display: flex;
}

.control-panel {
  width: 300px;
  flex-shrink: 0;
  background: #fff;
  padding: 16px;
  overflow-y: auto;
  border-right: 1px solid #e8e8e8;
}

.control-panel h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.panel-desc {
  font-size: 12px;
  color: #999;
  margin: 4px 0 0;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.type-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-desc {
  font-size: 11px;
  color: #888;
}

.mvt-note {
  font-size: 11px;
  color: #666;
  line-height: 1.65;
}

.mvt-note p {
  margin: 0 0 6px;
}

.mvt-note p:last-child {
  margin-bottom: 0;
}

.mvt-note code {
  font-size: 10px;
  background: #f5f5f5;
  padding: 1px 4px;
  border-radius: 2px;
  color: #d4380d;
}
.source-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.source-info-head {
  display: flex;
  align-items: center;
  gap: 6px;
}
.source-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.overlay-preview {
  width: 100%;
  display: block;
  border-radius: 4px;
  border: 1px solid #f0f0f0;
}

.image-coords-hint {
  margin: 8px 0 0;
  font-size: 11px;
  color: #888;
  line-height: 1.5;
}
.source-desc {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.url-template {
  margin-bottom: 8px;
}

.url-template code {
  font-size: 12px;
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 3px;
  color: #d4380d;
}

.url-explain {
  font-size: 12px;
  color: #666;
  line-height: 1.8;
}

.tips {
  margin-top: 16px;
  font-size: 12px;
  color: #999;
  line-height: 1.8;
}

.tips p {
  margin: 0;
}

.map-container {
  flex: 1;
  height: 100%;
}
</style>
