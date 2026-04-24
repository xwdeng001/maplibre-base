<script setup lang="ts">
/**
 * 第07课：GeoJSON 数据实战
 * 演示 GeoJSON 七种几何类型、动态加载与更新
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 当前选中的几何类型 */
const activeType = ref<string>('point')

/** 几何类型选项 */
const geoTypes = [
  { key: 'point', label: 'Point 点', icon: '📍' },
  { key: 'multipoint', label: 'MultiPoint 多点', icon: '📍📍' },
  { key: 'linestring', label: 'LineString 线', icon: '〰️' },
  { key: 'polygon', label: 'Polygon 多边形', icon: '⬡' },
  { key: 'mixed', label: '混合要素', icon: '🗺️' }
]

/** 要素总数 */
const featureCount = ref(0)

/** 示例数据 */
const geoData: Record<string, GeoJSON.FeatureCollection> = {
  point: {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', geometry: { type: 'Point', coordinates: [116.3912, 39.9073] }, properties: { name: '天安门', type: '景点' } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [116.3974, 39.9163] }, properties: { name: '故宫', type: '景点' } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [116.4074, 39.8887] }, properties: { name: '天坛', type: '公园' } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [116.2731, 39.9998] }, properties: { name: '颐和园', type: '公园' } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [116.4104, 39.9402] }, properties: { name: '雍和宫', type: '寺庙' } }
    ]
  },
  multipoint: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'MultiPoint',
          coordinates: [
            [116.39, 39.91], [121.47, 31.23], [113.26, 23.13],
            [104.07, 30.67], [106.55, 29.56]
          ]
        },
        properties: { name: '中国主要城市' }
      }
    ]
  },
  linestring: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [116.3280, 39.9075], [116.3580, 39.9075], [116.3912, 39.9073],
            [116.4200, 39.9073], [116.4500, 39.9073], [116.4700, 39.9073]
          ]
        },
        properties: { name: '长安街', length: '13.4km' }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [
            [116.3912, 39.9500], [116.3912, 39.9300], [116.3912, 39.9073],
            [116.3912, 39.8800], [116.3912, 39.8600]
          ]
        },
        properties: { name: '中轴线', length: '7.8km' }
      }
    ]
  },
  polygon: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.3780, 39.9230], [116.4120, 39.9230], [116.4120, 39.9080],
            [116.3780, 39.9080], [116.3780, 39.9230]
          ]]
        },
        properties: { name: '故宫区域', area: '72万㎡' }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.3900, 39.8980], [116.4200, 39.8980], [116.4200, 39.8750],
            [116.3900, 39.8750], [116.3900, 39.8980]
          ]]
        },
        properties: { name: '天坛区域', area: '273万㎡' }
      }
    ]
  },
  mixed: {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', geometry: { type: 'Point', coordinates: [116.3912, 39.9073] }, properties: { name: '天安门', featureType: 'point' } },
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [[116.3280, 39.9075], [116.3912, 39.9073], [116.4700, 39.9073]]
        },
        properties: { name: '长安街', featureType: 'line' }
      },
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[[116.3780, 39.9230], [116.4120, 39.9230], [116.4120, 39.9080], [116.3780, 39.9080], [116.3780, 39.9230]]]
        },
        properties: { name: '故宫', featureType: 'polygon' }
      }
    ]
  }
}

/** 清除所有演示图层和数据源 */
function clearLayers() {
  if (!map) return
  const layerIds = ['demo-circle', 'demo-label', 'demo-line', 'demo-fill', 'demo-outline']
  layerIds.forEach(id => {
    if (map!.getLayer(id)) map!.removeLayer(id)
  })
  if (map.getSource('demo-source')) map.removeSource('demo-source')
}

/** 渲染指定类型的数据 */
function renderType(type: string) {
  if (!map) return
  clearLayers()

  const data = geoData[type]
  if (!data) return

  featureCount.value = data.features.length

  map.addSource('demo-source', { type: 'geojson', data })

  /** 根据类型添加不同的图层 */
  if (type === 'point' || type === 'multipoint') {
    map.addLayer({
      id: 'demo-circle',
      type: 'circle',
      source: 'demo-source',
      paint: {
        'circle-radius': 8,
        'circle-color': '#1890ff',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    })
  }

  if (type === 'linestring') {
    map.addLayer({
      id: 'demo-line',
      type: 'line',
      source: 'demo-source',
      paint: { 'line-color': '#f5222d', 'line-width': 4 },
      layout: { 'line-cap': 'round', 'line-join': 'round' }
    })
  }

  if (type === 'polygon') {
    map.addLayer({
      id: 'demo-fill',
      type: 'fill',
      source: 'demo-source',
      paint: { 'fill-color': '#1890ff', 'fill-opacity': 0.3 }
    })
    map.addLayer({
      id: 'demo-outline',
      type: 'line',
      source: 'demo-source',
      paint: { 'line-color': '#1890ff', 'line-width': 2 }
    })
  }

  if (type === 'mixed') {
    /** 面 */
    map.addLayer({
      id: 'demo-fill',
      type: 'fill',
      source: 'demo-source',
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: { 'fill-color': '#722ed1', 'fill-opacity': 0.2 }
    })
    map.addLayer({
      id: 'demo-outline',
      type: 'line',
      source: 'demo-source',
      filter: ['==', ['geometry-type'], 'Polygon'],
      paint: { 'line-color': '#722ed1', 'line-width': 2 }
    })
    /** 线 */
    map.addLayer({
      id: 'demo-line',
      type: 'line',
      source: 'demo-source',
      filter: ['==', ['geometry-type'], 'LineString'],
      paint: { 'line-color': '#f5222d', 'line-width': 3 },
      layout: { 'line-cap': 'round' }
    })
    /** 点 */
    map.addLayer({
      id: 'demo-circle',
      type: 'circle',
      source: 'demo-source',
      filter: ['==', ['geometry-type'], 'Point'],
      paint: {
        'circle-radius': 8,
        'circle-color': '#fa8c16',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    })
  }

  /** 为带 name 的要素添加标注 */
  if (type === 'point') {
    map.addLayer({
      id: 'demo-label',
      type: 'symbol',
      source: 'demo-source',
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
}

/** 动态添加一个随机点 */
function addRandomPoint() {
  if (!map || activeType.value !== 'point') return
  const data = geoData['point']
  const lng = 116.2 + Math.random() * 0.3
  const lat = 39.8 + Math.random() * 0.2
  data.features.push({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lng, lat] },
    properties: { name: `随机点${data.features.length}`, type: '动态' }
  })
  const source = map.getSource('demo-source') as maplibregl.GeoJSONSource
  if (source) {
    source.setData(data)
    featureCount.value = data.features.length
  }
}

/** 切换类型时重新渲染 */
function handleTypeChange() {
  /** 自适应视图 */
  if (map) {
    if (activeType.value === 'multipoint') {
      map.flyTo({ center: [110, 32], zoom: 4, duration: 1000 })
    } else {
      map.flyTo({ center: [116.39, 39.91], zoom: 12, duration: 1000 })
    }
    /** 延迟渲染等待视图切换 */
    setTimeout(() => renderType(activeType.value), 300)
  }
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
    renderType(activeType.value)
  })

  /** 点击弹窗 */
  map.on('click', 'demo-circle', (e) => {
    if (!e.features || !e.features[0]) return
    const props = e.features[0].properties
    const coords = (e.features[0].geometry as GeoJSON.Point).coordinates as [number, number]
    new maplibregl.Popup({ offset: 15, closeButton: false })
      .setLngLat(coords)
      .setHTML(`<b>${props?.name || '未命名'}</b><br/>${props?.type || ''}`)
      .addTo(map!)
  })

  /** 鼠标样式 */
  map.on('mouseenter', 'demo-circle', () => { if (map) map.getCanvas().style.cursor = 'pointer' })
  map.on('mouseleave', 'demo-circle', () => { if (map) map.getCanvas().style.cursor = '' })
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
      <h3>07. GeoJSON 数据实战</h3>
      <p class="panel-desc">七种几何类型与动态数据管理</p>

      <a-divider style="margin: 12px 0" />

      <!-- 几何类型切换 -->
      <div class="section-title">选择几何类型</div>
      <a-radio-group v-model:value="activeType" @change="handleTypeChange" class="type-group">
        <a-radio-button v-for="t in geoTypes" :key="t.key" :value="t.key" class="type-btn">
          {{ t.icon }} {{ t.label }}
        </a-radio-button>
      </a-radio-group>

      <a-divider style="margin: 12px 0" />

      <!-- 当前数据信息 -->
      <a-card size="small" title="当前数据">
        <div class="data-info">
          <div>要素数量：<b>{{ featureCount }}</b></div>
          <div>几何类型：<a-tag color="blue">{{ activeType }}</a-tag></div>
        </div>
      </a-card>

      <!-- 动态操作 -->
      <div v-if="activeType === 'point'" style="margin-top: 12px;">
        <a-button type="primary" size="small" block @click="addRandomPoint">
          ➕ 动态添加随机点（setData）
        </a-button>
      </div>

      <a-divider style="margin: 12px 0" />

      <!-- GeoJSON 坐标说明 -->
      <a-card size="small" title="坐标系说明">
        <div class="coord-info">
          <div>📐 坐标系：<b>WGS 84 (EPSG:4326)</b></div>
          <div>📍 坐标顺序：<code>[经度, 纬度]</code></div>
          <div>🌐 经度范围：-180 ~ 180</div>
          <div>🌐 纬度范围：-90 ~ 90</div>
        </div>
      </a-card>

      <div class="tips">
        <p>💡 点击地图上的点可查看属性</p>
        <p>💡 Polygon 首尾坐标必须相同（闭合）</p>
        <p>💡 混合要素通过 filter 按几何类型分层渲染</p>
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

.type-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.type-btn {
  text-align: left !important;
  font-size: 13px;
}

.data-info {
  font-size: 13px;
  line-height: 2;
}

.coord-info {
  font-size: 12px;
  line-height: 2;
  color: #555;
}

.coord-info code {
  background: #f5f5f5;
  padding: 1px 6px;
  border-radius: 3px;
  color: #d4380d;
  font-size: 11px;
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
