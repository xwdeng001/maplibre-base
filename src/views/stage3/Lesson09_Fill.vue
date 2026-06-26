<script setup lang="ts">
/**
 * 第09课：Fill 填充图层
 * 演示多边形渲染、分级设色、动态属性调整
 */
import { ref, reactive, onMounted, onBeforeUnmount, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 填充属性控制 */
const fillProps = reactive({
  color: '#1890ff',
  opacity: 0.5,
  outlineColor: '#0050b3',
  showOutline: true
})

/** 当前模式 */
const mode = ref<'basic' | 'choropleth'>('basic')

/** 行政区域填色地图实战（文档示例） */
const districtPracticeOn = ref(false)

/** 分级设色 fill-color 表达式（按人口/万 interpolate） */
const choroplethFillColor: maplibregl.ExpressionSpecification = [
  'interpolate', ['linear'], ['get', 'population'],
  50, '#f0f9e8',
  100, '#bae4bc',
  200, '#7bccc4',
  300, '#43a2ca',
  350, '#0868ac'
]

const districtPracticeSteps = [
  { step: 1, title: '添加行政区划 GeoJSON', desc: 'addSource(\'districts\', { type: \'geojson\', data })' },
  { step: 2, title: 'Fill 分级设色', desc: 'fill-color 使用 interpolate + population' },
  { step: 3, title: 'Line 行政区边界', desc: '单独 line 图层绘制边界，样式更灵活' }
]

/** 北京区域模拟数据 */
const districtsData: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[116.33, 39.96], [116.42, 39.96], [116.42, 39.90], [116.33, 39.90], [116.33, 39.96]]] },
      properties: { name: '西城区', population: 110, level: '高' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[116.42, 39.96], [116.48, 39.96], [116.48, 39.90], [116.42, 39.90], [116.42, 39.96]]] },
      properties: { name: '东城区', population: 76, level: '高' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[116.25, 39.96], [116.33, 39.96], [116.33, 39.87], [116.25, 39.87], [116.25, 39.96]]] },
      properties: { name: '海淀区', population: 313, level: '中' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[116.48, 39.96], [116.56, 39.96], [116.56, 39.87], [116.48, 39.87], [116.48, 39.96]]] },
      properties: { name: '朝阳区', population: 345, level: '中' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[116.33, 39.90], [116.48, 39.90], [116.48, 39.84], [116.33, 39.84], [116.33, 39.90]]] },
      properties: { name: '丰台区', population: 195, level: '低' }
    },
    {
      type: 'Feature',
      geometry: { type: 'Polygon', coordinates: [[[116.25, 39.87], [116.33, 39.87], [116.33, 39.80], [116.25, 39.80], [116.25, 39.87]]] },
      properties: { name: '石景山区', population: 55, level: '低' }
    }
  ]
}

/** 监听属性变化，实时更新 */
watch(() => fillProps.opacity, (val) => {
  if (map?.getLayer('districts-fill')) {
    map.setPaintProperty('districts-fill', 'fill-opacity', val)
  }
})

watch(() => fillProps.showOutline, (val) => {
  if (map?.getLayer('districts-outline')) {
    map.setLayoutProperty('districts-outline', 'visibility', val ? 'visible' : 'none')
  }
})

/** 应用文档「行政区域填色地图实战」样式 */
function applyDistrictChoroplethPractice() {
  if (!map?.getLayer('districts-fill')) return
  mode.value = 'choropleth'
  fillProps.opacity = 0.7
  fillProps.showOutline = true
  map.setPaintProperty('districts-fill', 'fill-color', choroplethFillColor)
  map.setPaintProperty('districts-fill', 'fill-opacity', 0.7)
  map.setPaintProperty('districts-outline', 'line-color', '#333')
  map.setPaintProperty('districts-outline', 'line-width', 1)
  map.setLayoutProperty('districts-outline', 'visibility', 'visible')
}

watch(districtPracticeOn, (on) => {
  if (on) applyDistrictChoroplethPractice()
})

/** 切换模式 */
watch(mode, (val) => {
  if (!map?.getLayer('districts-fill')) return
  if (val === 'basic') {
    districtPracticeOn.value = false
    map.setPaintProperty('districts-fill', 'fill-color', fillProps.color)
    map.setPaintProperty('districts-outline', 'line-color', fillProps.outlineColor)
    map.setPaintProperty('districts-outline', 'line-width', 2)
  } else {
    map.setPaintProperty('districts-fill', 'fill-color', choroplethFillColor)
  }
})

/** 更新基础颜色 */
function updateColor() {
  if (map?.getLayer('districts-fill') && mode.value === 'basic') {
    map.setPaintProperty('districts-fill', 'fill-color', fillProps.color)
  }
}

/** 颜色预设 */
const colorPresets = [
  { label: '蓝色', value: '#1890ff' },
  { label: '红色', value: '#f5222d' },
  { label: '绿色', value: '#52c41a' },
  { label: '紫色', value: '#722ed1' },
  { label: '橙色', value: '#fa8c16' }
]

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.39, 39.91],
    zoom: 11
  })

  map.on('load', () => {
    /** 添加数据源 */
    map!.addSource('districts', { type: 'geojson', data: districtsData })

    /** 填充图层 */
    map!.addLayer({
      id: 'districts-fill',
      type: 'fill',
      source: 'districts',
      paint: {
        'fill-color': fillProps.color,
        'fill-opacity': fillProps.opacity
      }
    })

    /** 边框图层 */
    map!.addLayer({
      id: 'districts-outline',
      type: 'line',
      source: 'districts',
      paint: {
        'line-color': fillProps.outlineColor,
        'line-width': 2
      }
    })

    /** 标注图层 */
    map!.addLayer({
      id: 'districts-label',
      type: 'symbol',
      source: 'districts',
      layout: {
        'text-field': ['concat', ['get', 'name'], '\n', ['to-string', ['get', 'population']], '万'],
        'text-size': 12
      },
      paint: {
        'text-color': '#333',
        'text-halo-color': '#fff',
        'text-halo-width': 1.5
      }
    })

    /** 点击弹窗 */
    map!.on('click', 'districts-fill', (e) => {
      if (!e.features?.[0]) return
      const p = e.features[0].properties
      new maplibregl.Popup({ offset: 5, closeButton: false })
        .setLngLat(e.lngLat)
        .setHTML(`<b>${p?.name}</b><br/>人口: ${p?.population}万<br/>级别: ${p?.level}`)
        .addTo(map!)
    })

    map!.on('mouseenter', 'districts-fill', () => { map!.getCanvas().style.cursor = 'pointer' })
    map!.on('mouseleave', 'districts-fill', () => { map!.getCanvas().style.cursor = '' })

    if (districtPracticeOn.value) applyDistrictChoroplethPractice()
  })
}

onMounted(() => initMap())
onBeforeUnmount(() => { if (map) { map.remove(); map = null } })
</script>

<template>
  <div class="lesson-page">
    <div class="control-panel">
      <h3>09. Fill 填充图层</h3>
      <p class="panel-desc">多边形渲染与分级设色</p>

      <a-card size="small" title="行政区域填色地图实战" class="practice-card">
        <p class="practice-intro">按文档三步：GeoJSON 源 → Fill 分级设色 → Line 边界</p>
        <div v-for="s in districtPracticeSteps" :key="s.step" class="practice-step">
          <a-tag color="blue" style="margin: 0">{{ s.step }}</a-tag>
          <div>
            <div class="practice-step-title">{{ s.title }}</div>
            <div class="practice-step-desc">{{ s.desc }}</div>
          </div>
        </div>
        <div class="control-row practice-switch">
          <span class="label">应用实战样式</span>
          <a-switch v-model:checked="districtPracticeOn" size="small" />
        </div>
        <p v-if="districtPracticeOn" class="practice-hint">已切换分级设色，fill-opacity 0.7，边框 #333 / 1px</p>
      </a-card>

      <a-divider style="margin: 12px 0" />

      <!-- 模式切换 -->
      <div class="section-title">渲染模式</div>
      <a-radio-group v-model:value="mode" size="small" option-type="button">
        <a-radio-button value="basic">固定颜色</a-radio-button>
        <a-radio-button value="choropleth">分级设色</a-radio-button>
      </a-radio-group>

      <a-divider style="margin: 12px 0" />

      <!-- 固定颜色模式 -->
      <template v-if="mode === 'basic'">
        <div class="section-title">fill-color</div>
        <div class="color-presets">
          <span v-for="c in colorPresets" :key="c.value" class="color-dot"
            :style="{ background: c.value, outline: fillProps.color === c.value ? '2px solid #333' : 'none' }"
            @click="fillProps.color = c.value; updateColor()" :title="c.label"></span>
        </div>
      </template>

      <!-- 分级设色图例 -->
      <template v-else>
        <div class="section-title">分级设色图例（人口/万）</div>
        <div class="legend">
          <div class="legend-item"><span class="legend-color" style="background:#f0f9e8"></span> &lt; 50</div>
          <div class="legend-item"><span class="legend-color" style="background:#bae4bc"></span> 50 ~ 100</div>
          <div class="legend-item"><span class="legend-color" style="background:#7bccc4"></span> 100 ~ 200</div>
          <div class="legend-item"><span class="legend-color" style="background:#43a2ca"></span> 200 ~ 300</div>
          <div class="legend-item"><span class="legend-color" style="background:#0868ac"></span> &gt; 300</div>
        </div>
      </template>

      <a-divider style="margin: 12px 0" />

      <!-- 透明度 -->
      <div class="control-row">
        <span class="label">fill-opacity</span>
        <a-slider v-model:value="fillProps.opacity" :min="0" :max="1" :step="0.05" style="width: 140px" />
        <span class="value">{{ fillProps.opacity }}</span>
      </div>

      <!-- 边框开关 -->
      <div class="control-row">
        <span class="label">显示边框</span>
        <a-switch v-model:checked="fillProps.showOutline" size="small" />
      </div>

      <div class="tips">
        <p>💡 点击区域查看属性信息</p>
        <p>💡 分级设色使用 interpolate 表达式</p>
        <p>💡 边框建议用单独的 Line 图层</p>
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
.color-presets { display: flex; gap: 8px; margin-bottom: 8px; }
.color-dot { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; outline-offset: 3px; transition: all .2s; }
.legend { font-size: 12px; }
.legend-item { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.legend-color { width: 20px; height: 14px; border-radius: 2px; border: 1px solid #ddd; }
.practice-card { margin-top: 12px; }
.practice-intro { font-size: 12px; color: #666; margin: 0 0 10px; line-height: 1.5; }
.practice-step { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px; }
.practice-step-title { font-size: 12px; font-weight: 600; color: #333; }
.practice-step-desc { font-size: 11px; color: #888; margin-top: 2px; font-family: ui-monospace, monospace; }
.practice-switch { margin: 10px 0 0; margin-bottom: 0 !important; }
.practice-hint { font-size: 11px; color: #52c41a; margin: 8px 0 0; }
.tips { margin-top: 16px; font-size: 12px; color: #999; line-height: 1.8; }
.tips p { margin: 0; }
.map-container { flex: 1; height: 100%; }
</style>
