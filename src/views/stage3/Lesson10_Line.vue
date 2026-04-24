<script setup lang="ts">
/**
 * 第10课：Line 线图层
 * 演示线宽/颜色/虚线/线端/渐变等属性
 */
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 线属性控制 */
const lineProps = reactive({
  color: '#1890ff',
  width: 4,
  opacity: 1,
  cap: 'round' as 'butt' | 'round' | 'square',
  join: 'round' as 'bevel' | 'round' | 'miter',
  dashType: 'solid' as 'solid' | 'dash' | 'dot' | 'dashdot'
})

/** 是否使用渐变 */
const useGradient = ref(false)

/** 虚线映射 */
const dashMap: Record<string, number[] | undefined> = {
  solid: undefined,
  dash: [4, 2],
  dot: [1, 2],
  dashdot: [4, 2, 1, 2]
}

/** 路线数据（长安街+中轴线） */
const routeData: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [116.2800, 39.9075], [116.3200, 39.9075], [116.3600, 39.9074],
          [116.3912, 39.9073], [116.4200, 39.9073], [116.4600, 39.9073], [116.4900, 39.9073]
        ]
      },
      properties: { name: '长安街' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [116.3912, 39.9500], [116.3912, 39.9400], [116.3912, 39.9300],
          [116.3912, 39.9200], [116.3912, 39.9073], [116.3912, 39.8900],
          [116.3912, 39.8700], [116.3912, 39.8500]
        ]
      },
      properties: { name: '中轴线' }
    }
  ]
}

/** 更新线样式 */
function updateLineStyle() {
  if (!map) return
  if (map.getLayer('route-line')) {
    map.setPaintProperty('route-line', 'line-color', lineProps.color)
    map.setPaintProperty('route-line', 'line-width', lineProps.width)
    map.setPaintProperty('route-line', 'line-opacity', lineProps.opacity)
    const dash = dashMap[lineProps.dashType]
    map.setPaintProperty('route-line', 'line-dasharray', dash || null)
    map.setLayoutProperty('route-line', 'line-cap', lineProps.cap)
    map.setLayoutProperty('route-line', 'line-join', lineProps.join)
  }
}

watch(lineProps, updateLineStyle, { deep: true })

/** 切换渐变模式 */
watch(useGradient, (val) => {
  if (!map) return
  /** 需要移除旧图层重建 */
  if (map.getLayer('route-line')) map.removeLayer('route-line')
  if (map.getSource('route')) map.removeSource('route')

  map.addSource('route', {
    type: 'geojson',
    data: routeData,
    lineMetrics: val
  })

  if (val) {
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-width': lineProps.width,
        'line-gradient': [
          'interpolate', ['linear'], ['line-progress'],
          0, '#1890ff',
          0.5, '#52c41a',
          1, '#f5222d'
        ]
      }
    })
  } else {
    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: { 'line-cap': lineProps.cap, 'line-join': lineProps.join },
      paint: {
        'line-color': lineProps.color,
        'line-width': lineProps.width,
        'line-opacity': lineProps.opacity
      }
    })
  }
})

const colorPresets = [
  { label: '蓝', value: '#1890ff' },
  { label: '红', value: '#f5222d' },
  { label: '绿', value: '#52c41a' },
  { label: '紫', value: '#722ed1' },
  { label: '橙', value: '#fa8c16' }
]

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.39, 39.91],
    zoom: 12
  })

  map.on('load', () => {
    map!.addSource('route', { type: 'geojson', data: routeData })
    map!.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: { 'line-cap': lineProps.cap, 'line-join': lineProps.join },
      paint: {
        'line-color': lineProps.color,
        'line-width': lineProps.width,
        'line-opacity': lineProps.opacity
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
      <h3>10. Line 线图层</h3>
      <p class="panel-desc">线宽/颜色/虚线/端点/渐变</p>

      <a-divider style="margin: 12px 0" />

      <!-- 渐变开关 -->
      <div class="control-row">
        <span class="label">line-gradient 渐变</span>
        <a-switch v-model:checked="useGradient" size="small" />
      </div>

      <template v-if="!useGradient">
        <!-- 颜色 -->
        <div class="section-title">line-color</div>
        <div class="color-presets">
          <span v-for="c in colorPresets" :key="c.value" class="color-dot"
            :style="{ background: c.value, outline: lineProps.color === c.value ? '2px solid #333' : 'none' }"
            @click="lineProps.color = c.value" :title="c.label"></span>
        </div>

        <!-- 虚线 -->
        <div class="control-row">
          <span class="label">line-dasharray</span>
          <a-select v-model:value="lineProps.dashType" size="small" style="width: 120px">
            <a-select-option value="solid">实线</a-select-option>
            <a-select-option value="dash">虚线 [4,2]</a-select-option>
            <a-select-option value="dot">点线 [1,2]</a-select-option>
            <a-select-option value="dashdot">点划线</a-select-option>
          </a-select>
        </div>
      </template>

      <!-- 线宽 -->
      <div class="control-row">
        <span class="label">line-width</span>
        <a-slider v-model:value="lineProps.width" :min="1" :max="15" :step="1" style="width: 120px" />
        <span class="value">{{ lineProps.width }}px</span>
      </div>

      <!-- 透明度 -->
      <div class="control-row" v-if="!useGradient">
        <span class="label">line-opacity</span>
        <a-slider v-model:value="lineProps.opacity" :min="0" :max="1" :step="0.05" style="width: 120px" />
        <span class="value">{{ lineProps.opacity }}</span>
      </div>

      <a-divider style="margin: 12px 0" />

      <!-- line-cap -->
      <div class="control-row" v-if="!useGradient">
        <span class="label">line-cap</span>
        <a-radio-group v-model:value="lineProps.cap" size="small" option-type="button">
          <a-radio-button value="butt">butt</a-radio-button>
          <a-radio-button value="round">round</a-radio-button>
          <a-radio-button value="square">square</a-radio-button>
        </a-radio-group>
      </div>

      <!-- line-join -->
      <div class="control-row" v-if="!useGradient">
        <span class="label">line-join</span>
        <a-radio-group v-model:value="lineProps.join" size="small" option-type="button">
          <a-radio-button value="miter">miter</a-radio-button>
          <a-radio-button value="round">round</a-radio-button>
          <a-radio-button value="bevel">bevel</a-radio-button>
        </a-radio-group>
      </div>

      <div class="tips">
        <p>💡 渐变线需要 lineMetrics: true</p>
        <p>💡 line-cap 控制线段端点形状</p>
        <p>💡 line-join 控制线段连接处形状</p>
        <p>💡 dasharray 不支持与渐变同时使用</p>
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
.control-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
.control-row .label { font-size: 13px; color: #555; min-width: 110px; }
.control-row .value { font-size: 13px; color: #1890ff; font-weight: 500; }
.color-presets { display: flex; gap: 8px; margin-bottom: 12px; }
.color-dot { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; outline-offset: 3px; transition: all .2s; }
.tips { margin-top: 16px; font-size: 12px; color: #999; line-height: 1.8; }
.tips p { margin: 0; }
.map-container { flex: 1; height: 100%; }
</style>
