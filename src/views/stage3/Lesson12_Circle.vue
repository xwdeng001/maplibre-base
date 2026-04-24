<script setup lang="ts">
/**
 * 第12课：Circle 圆点图层
 * 演示散点图、数据驱动样式
 */
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 控制属性 */
const circleProps = reactive({
  radius: 8,
  opacity: 0.8,
  strokeWidth: 2,
  blur: 0,
  colorMode: 'fixed' as 'fixed' | 'byType' | 'byValue',
  sizeMode: 'fixed' as 'fixed' | 'byValue'
})

/** 模拟散点数据 */
function generatePoints(): GeoJSON.FeatureCollection {
  const types = ['景点', '公园', '商业', '交通']
  const features: GeoJSON.Feature[] = []
  for (let i = 0; i < 60; i++) {
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [116.2 + Math.random() * 0.35, 39.8 + Math.random() * 0.2]
      },
      properties: {
        id: i,
        name: `点位${i + 1}`,
        type: types[Math.floor(Math.random() * types.length)],
        value: Math.floor(Math.random() * 100)
      }
    })
  }
  return { type: 'FeatureCollection', features }
}

const pointsData = generatePoints()

/** 更新样式 */
function updateStyle() {
  if (!map?.getLayer('points-circle')) return

  /** 半径 */
  if (circleProps.sizeMode === 'fixed') {
    map.setPaintProperty('points-circle', 'circle-radius', circleProps.radius)
  } else {
    map.setPaintProperty('points-circle', 'circle-radius', [
      'interpolate', ['linear'], ['get', 'value'], 0, 4, 50, 10, 100, 20
    ])
  }

  /** 颜色 */
  if (circleProps.colorMode === 'fixed') {
    map.setPaintProperty('points-circle', 'circle-color', '#1890ff')
  } else if (circleProps.colorMode === 'byType') {
    map.setPaintProperty('points-circle', 'circle-color', [
      'match', ['get', 'type'],
      '景点', '#1890ff', '公园', '#52c41a', '商业', '#fa8c16', '交通', '#722ed1', '#999'
    ])
  } else {
    map.setPaintProperty('points-circle', 'circle-color', [
      'interpolate', ['linear'], ['get', 'value'], 0, '#52c41a', 50, '#faad14', 100, '#f5222d'
    ])
  }

  map.setPaintProperty('points-circle', 'circle-opacity', circleProps.opacity)
  map.setPaintProperty('points-circle', 'circle-stroke-width', circleProps.strokeWidth)
  map.setPaintProperty('points-circle', 'circle-blur', circleProps.blur)
}

watch(circleProps, updateStyle, { deep: true })

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.39, 39.91],
    zoom: 11
  })

  map.on('load', () => {
    map!.addSource('points', { type: 'geojson', data: pointsData })
    map!.addLayer({
      id: 'points-circle',
      type: 'circle',
      source: 'points',
      paint: {
        'circle-radius': circleProps.radius,
        'circle-color': '#1890ff',
        'circle-opacity': circleProps.opacity,
        'circle-stroke-width': circleProps.strokeWidth,
        'circle-stroke-color': '#fff',
        'circle-blur': circleProps.blur
      }
    })

    map!.on('click', 'points-circle', (e) => {
      if (!e.features?.[0]) return
      const p = e.features[0].properties
      new maplibregl.Popup({ offset: 10, closeButton: false })
        .setLngLat(e.lngLat)
        .setHTML(`<b>${p?.name}</b><br/>类型: ${p?.type}<br/>值: ${p?.value}`)
        .addTo(map!)
    })
    map!.on('mouseenter', 'points-circle', () => { map!.getCanvas().style.cursor = 'pointer' })
    map!.on('mouseleave', 'points-circle', () => { map!.getCanvas().style.cursor = '' })
  })
}

onMounted(() => initMap())
onBeforeUnmount(() => { if (map) { map.remove(); map = null } })
</script>

<template>
  <div class="lesson-page">
    <div class="control-panel">
      <h3>12. Circle 圆点图层</h3>
      <p class="panel-desc">散点图与数据驱动样式</p>

      <a-divider style="margin: 12px 0" />

      <div class="section-title">颜色映射</div>
      <a-radio-group v-model:value="circleProps.colorMode" size="small" option-type="button">
        <a-radio-button value="fixed">固定</a-radio-button>
        <a-radio-button value="byType">按类型</a-radio-button>
        <a-radio-button value="byValue">按数值</a-radio-button>
      </a-radio-group>

      <!-- 颜色图例 -->
      <div v-if="circleProps.colorMode === 'byType'" class="legend" style="margin-top: 8px;">
        <div class="legend-item"><span class="legend-dot" style="background:#1890ff"></span> 景点</div>
        <div class="legend-item"><span class="legend-dot" style="background:#52c41a"></span> 公园</div>
        <div class="legend-item"><span class="legend-dot" style="background:#fa8c16"></span> 商业</div>
        <div class="legend-item"><span class="legend-dot" style="background:#722ed1"></span> 交通</div>
      </div>
      <div v-if="circleProps.colorMode === 'byValue'" class="legend" style="margin-top: 8px;">
        <div class="gradient-bar"></div>
        <div class="gradient-labels"><span>0</span><span>50</span><span>100</span></div>
      </div>

      <a-divider style="margin: 12px 0" />

      <div class="section-title">大小映射</div>
      <a-radio-group v-model:value="circleProps.sizeMode" size="small" option-type="button">
        <a-radio-button value="fixed">固定</a-radio-button>
        <a-radio-button value="byValue">按数值</a-radio-button>
      </a-radio-group>

      <div v-if="circleProps.sizeMode === 'fixed'" class="control-row" style="margin-top: 8px;">
        <span class="label">circle-radius</span>
        <a-slider v-model:value="circleProps.radius" :min="2" :max="20" style="width: 120px" />
        <span class="value">{{ circleProps.radius }}</span>
      </div>

      <a-divider style="margin: 12px 0" />

      <div class="control-row">
        <span class="label">circle-opacity</span>
        <a-slider v-model:value="circleProps.opacity" :min="0" :max="1" :step="0.05" style="width: 120px" />
        <span class="value">{{ circleProps.opacity }}</span>
      </div>

      <div class="control-row">
        <span class="label">circle-stroke</span>
        <a-slider v-model:value="circleProps.strokeWidth" :min="0" :max="5" style="width: 120px" />
        <span class="value">{{ circleProps.strokeWidth }}</span>
      </div>

      <div class="control-row">
        <span class="label">circle-blur</span>
        <a-slider v-model:value="circleProps.blur" :min="0" :max="2" :step="0.1" style="width: 120px" />
        <span class="value">{{ circleProps.blur }}</span>
      </div>

      <div class="tips">
        <p>💡 60个随机点位，点击查看属性</p>
        <p>💡 数据驱动：interpolate 连续映射</p>
        <p>💡 分类驱动：match 按类型着色</p>
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
.control-row .label { font-size: 13px; color: #555; min-width: 100px; }
.control-row .value { font-size: 13px; color: #1890ff; font-weight: 500; }
.legend { font-size: 12px; }
.legend-item { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
.legend-dot { width: 12px; height: 12px; border-radius: 50%; }
.gradient-bar { height: 12px; border-radius: 6px; background: linear-gradient(to right, #52c41a, #faad14, #f5222d); }
.gradient-labels { display: flex; justify-content: space-between; font-size: 10px; color: #999; }
.tips { margin-top: 16px; font-size: 12px; color: #999; line-height: 1.8; }
.tips p { margin: 0; }
.map-container { flex: 1; height: 100%; }
</style>
