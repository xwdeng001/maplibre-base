<script setup lang="ts">
/**
 * 第11课：Symbol 符号图层
 * 演示文字标注、自定义图标、碰撞检测
 */
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 标注属性控制 */
const symbolProps = reactive({
  textSize: 14,
  textColor: '#333333',
  haloWidth: 1.5,
  haloColor: '#ffffff',
  allowOverlap: false,
  showIcon: true
})

/** 城市数据 */
const citiesData: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', geometry: { type: 'Point', coordinates: [116.3912, 39.9073] }, properties: { name: '北京', pop: 2154, rank: 1 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [121.4737, 31.2304] }, properties: { name: '上海', pop: 2487, rank: 2 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [113.2644, 23.1291] }, properties: { name: '广州', pop: 1868, rank: 3 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [114.0579, 22.5431] }, properties: { name: '深圳', pop: 1756, rank: 4 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [104.0657, 30.5723] }, properties: { name: '成都', pop: 2094, rank: 5 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [106.5516, 29.5630] }, properties: { name: '重庆', pop: 3205, rank: 6 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [120.1551, 30.2741] }, properties: { name: '杭州', pop: 1194, rank: 7 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [118.7969, 32.0603] }, properties: { name: '南京', pop: 942, rank: 8 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [114.3055, 30.5928] }, properties: { name: '武汉', pop: 1233, rank: 9 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [117.2009, 39.0842] }, properties: { name: '天津', pop: 1373, rank: 10 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [108.9402, 34.2609] }, properties: { name: '西安', pop: 1295, rank: 11 } },
    { type: 'Feature', geometry: { type: 'Point', coordinates: [126.6424, 45.7570] }, properties: { name: '哈尔滨', pop: 1001, rank: 12 } }
  ]
}

/** 创建自定义图标，返回 ImageData 格式 */
function createCustomIcon(): { width: number; height: number; data: Uint8ClampedArray } {
  const size = 32
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  /** 绘制圆形标记 */
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2)
  ctx.fillStyle = '#1890ff'
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2
  ctx.stroke()
  /** 绘制内部小圆 */
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, 4, 0, Math.PI * 2)
  ctx.fillStyle = '#fff'
  ctx.fill()
  const imageData = ctx.getImageData(0, 0, size, size)
  return { width: size, height: size, data: imageData.data }
}

/** 更新文字样式 */
watch(() => symbolProps.textSize, (val) => {
  if (map?.getLayer('city-labels')) map.setLayoutProperty('city-labels', 'text-size', val)
})

watch(() => symbolProps.textColor, (val) => {
  if (map?.getLayer('city-labels')) map.setPaintProperty('city-labels', 'text-color', val)
})

watch(() => symbolProps.haloWidth, (val) => {
  if (map?.getLayer('city-labels')) map.setPaintProperty('city-labels', 'text-halo-width', val)
})

watch(() => symbolProps.allowOverlap, (val) => {
  if (map?.getLayer('city-labels')) {
    map.setLayoutProperty('city-labels', 'text-allow-overlap', val)
    map.setLayoutProperty('city-labels', 'icon-allow-overlap', val)
  }
})

watch(() => symbolProps.showIcon, (val) => {
  if (map?.getLayer('city-labels')) {
    map.setLayoutProperty('city-labels', 'icon-image', val ? 'city-marker' : '')
  }
})

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [110, 34],
    zoom: 4
  })

  map.on('load', () => {
    /** 注册自定义图标 */
    map!.addImage('city-marker', createCustomIcon())

    /** 添加数据源 */
    map!.addSource('cities', { type: 'geojson', data: citiesData })

    /** Symbol 图层 */
    map!.addLayer({
      id: 'city-labels',
      type: 'symbol',
      source: 'cities',
      layout: {
        'icon-image': 'city-marker',
        'icon-size': 0.8,
        'icon-anchor': 'center',
        'text-field': ['get', 'name'],
        'text-size': symbolProps.textSize,
        'text-anchor': 'top',
        'text-offset': [0, 1.2],
        'text-allow-overlap': false,
        'icon-allow-overlap': false,
        'symbol-sort-key': ['get', 'rank']
      },
      paint: {
        'text-color': symbolProps.textColor,
        'text-halo-color': symbolProps.haloColor,
        'text-halo-width': symbolProps.haloWidth
      }
    })

    /** 点击弹窗 */
    map!.on('click', 'city-labels', (e) => {
      if (!e.features?.[0]) return
      const p = e.features[0].properties
      const coords = (e.features[0].geometry as GeoJSON.Point).coordinates as [number, number]
      new maplibregl.Popup({ offset: 20, closeButton: false })
        .setLngLat(coords)
        .setHTML(`<b>${p?.name}</b><br/>人口: ${p?.pop}万`)
        .addTo(map!)
    })

    map!.on('mouseenter', 'city-labels', () => { map!.getCanvas().style.cursor = 'pointer' })
    map!.on('mouseleave', 'city-labels', () => { map!.getCanvas().style.cursor = '' })
  })
}

onMounted(() => initMap())
onBeforeUnmount(() => { if (map) { map.remove(); map = null } })
</script>

<template>
  <div class="lesson-page">
    <div class="control-panel">
      <h3>11. Symbol 符号图层</h3>
      <p class="panel-desc">文字标注、自定义图标、碰撞检测</p>

      <a-divider style="margin: 12px 0" />

      <div class="control-row">
        <span class="label">text-size</span>
        <a-slider v-model:value="symbolProps.textSize" :min="8" :max="24" :step="1" style="width: 120px" />
        <span class="value">{{ symbolProps.textSize }}</span>
      </div>

      <div class="control-row">
        <span class="label">text-halo-width</span>
        <a-slider v-model:value="symbolProps.haloWidth" :min="0" :max="4" :step="0.5" style="width: 120px" />
        <span class="value">{{ symbolProps.haloWidth }}</span>
      </div>

      <div class="control-row">
        <span class="label">显示图标</span>
        <a-switch v-model:checked="symbolProps.showIcon" size="small" />
      </div>

      <div class="control-row">
        <span class="label">允许重叠</span>
        <a-switch v-model:checked="symbolProps.allowOverlap" size="small" />
      </div>

      <a-divider style="margin: 12px 0" />

      <a-card size="small" title="关键概念">
        <div class="concept-list">
          <div><b>text-field</b>：标注内容，支持表达式</div>
          <div><b>text-halo</b>：文字光晕，提高可读性</div>
          <div><b>addImage</b>：注册自定义图标</div>
          <div><b>碰撞检测</b>：自动隐藏重叠标注</div>
          <div><b>symbol-sort-key</b>：排序优先级</div>
        </div>
      </a-card>

      <div class="tips">
        <p>💡 点击城市标注查看人口信息</p>
        <p>💡 关闭"允许重叠"观察碰撞检测</p>
        <p>💡 图标使用 Canvas 动态绘制</p>
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
.control-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.control-row .label { font-size: 13px; color: #555; min-width: 110px; }
.control-row .value { font-size: 13px; color: #1890ff; font-weight: 500; }
.concept-list { font-size: 12px; line-height: 2; color: #555; }
.tips { margin-top: 16px; font-size: 12px; color: #999; line-height: 1.8; }
.tips p { margin: 0; }
.map-container { flex: 1; height: 100%; }
</style>
