<script setup lang="ts">
/**
 * 第19课：表达式系统入门
 * 演示 get/case/match/interpolate/step 表达式
 */
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 当前表达式类型 */
const exprType = ref<'match' | 'case' | 'interpolate' | 'step'>('match')

/** 模拟数据 */
function generateData(): GeoJSON.FeatureCollection {
  const types = ['景点', '公园', '商业', '交通']
  const levels = ['高', '中', '低']
  const features: GeoJSON.Feature[] = []
  for (let i = 0; i < 50; i++) {
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [116.2 + Math.random() * 0.35, 39.82 + Math.random() * 0.18] },
      properties: {
        name: `POI-${i + 1}`,
        type: types[Math.floor(Math.random() * types.length)],
        level: levels[Math.floor(Math.random() * levels.length)],
        value: Math.floor(Math.random() * 100)
      }
    })
  }
  return { type: 'FeatureCollection', features }
}

/** 表达式配置 */
const expressions: Record<string, { color: any; label: string; desc: string }> = {
  match: {
    label: 'match',
    desc: '按 type 属性匹配颜色',
    color: ['match', ['get', 'type'], '景点', '#1890ff', '公园', '#52c41a', '商业', '#fa8c16', '交通', '#722ed1', '#999']
  },
  case: {
    label: 'case',
    desc: '按 level 属性条件分支',
    color: ['case', ['==', ['get', 'level'], '高'], '#f5222d', ['==', ['get', 'level'], '中'], '#faad14', '#52c41a']
  },
  interpolate: {
    label: 'interpolate',
    desc: '按 value (0-100) 连续插值',
    color: ['interpolate', ['linear'], ['get', 'value'], 0, '#52c41a', 50, '#faad14', 100, '#f5222d']
  },
  step: {
    label: 'step',
    desc: '按 value 阶梯分段',
    color: ['step', ['get', 'value'], '#52c41a', 33, '#faad14', 66, '#f5222d']
  }
}

/** 切换表达式 */
watch(exprType, (type) => {
  if (!map?.getLayer('expr-circle')) return
  map.setPaintProperty('expr-circle', 'circle-color', expressions[type].color)
})

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.39, 39.91],
    zoom: 11
  })

  map.on('load', () => {
    map!.addSource('expr-data', { type: 'geojson', data: generateData() })
    map!.addLayer({
      id: 'expr-circle',
      type: 'circle',
      source: 'expr-data',
      paint: {
        'circle-radius': 8,
        'circle-color': expressions.match.color,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
        'circle-opacity': 0.85
      }
    })

    map!.on('click', 'expr-circle', (e) => {
      if (!e.features?.[0]) return
      const p = e.features[0].properties
      new maplibregl.Popup({ offset: 12, closeButton: false })
        .setLngLat(e.lngLat)
        .setHTML(`<b>${p?.name}</b><br/>类型: ${p?.type}<br/>级别: ${p?.level}<br/>数值: ${p?.value}`)
        .addTo(map!)
    })
    map!.on('mouseenter', 'expr-circle', () => { map!.getCanvas().style.cursor = 'pointer' })
    map!.on('mouseleave', 'expr-circle', () => { map!.getCanvas().style.cursor = '' })
  })
}

onMounted(() => initMap())
onBeforeUnmount(() => { if (map) { map.remove(); map = null } })
</script>

<template>
  <div class="lesson-page">
    <div class="control-panel">
      <h3>19. 表达式系统入门</h3>
      <p class="panel-desc">get/case/match/interpolate/step</p>

      <a-divider style="margin: 12px 0" />

      <div class="section-title">选择表达式类型</div>
      <a-radio-group v-model:value="exprType" class="expr-group">
        <a-radio v-for="(cfg, key) in expressions" :key="key" :value="key">
          <code>{{ cfg.label }}</code>
          <div class="expr-desc">{{ cfg.desc }}</div>
        </a-radio>
      </a-radio-group>

      <a-divider style="margin: 12px 0" />

      <!-- 图例 -->
      <a-card size="small" title="当前颜色图例">
        <template v-if="exprType === 'match'">
          <div class="legend-item"><span class="l-dot" style="background:#1890ff"></span> 景点</div>
          <div class="legend-item"><span class="l-dot" style="background:#52c41a"></span> 公园</div>
          <div class="legend-item"><span class="l-dot" style="background:#fa8c16"></span> 商业</div>
          <div class="legend-item"><span class="l-dot" style="background:#722ed1"></span> 交通</div>
        </template>
        <template v-if="exprType === 'case'">
          <div class="legend-item"><span class="l-dot" style="background:#f5222d"></span> 高</div>
          <div class="legend-item"><span class="l-dot" style="background:#faad14"></span> 中</div>
          <div class="legend-item"><span class="l-dot" style="background:#52c41a"></span> 低</div>
        </template>
        <template v-if="exprType === 'interpolate'">
          <div class="gradient-bar" style="background:linear-gradient(to right,#52c41a,#faad14,#f5222d)"></div>
          <div class="gradient-labels"><span>0</span><span>50</span><span>100</span></div>
        </template>
        <template v-if="exprType === 'step'">
          <div class="legend-item"><span class="l-dot" style="background:#52c41a"></span> &lt; 33</div>
          <div class="legend-item"><span class="l-dot" style="background:#faad14"></span> 33 ~ 66</div>
          <div class="legend-item"><span class="l-dot" style="background:#f5222d"></span> ≥ 66</div>
        </template>
      </a-card>

      <div class="tips">
        <p>💡 点击圆点查看要素属性</p>
        <p>💡 match 按值精确匹配</p>
        <p>💡 interpolate 连续渐变</p>
        <p>💡 step 阶梯式分段</p>
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
.expr-group { display: flex; flex-direction: column; gap: 8px; }
.expr-group code { font-size: 13px; color: #d4380d; background: #f5f5f5; padding: 1px 6px; border-radius: 3px; }
.expr-desc { font-size: 11px; color: #888; margin-top: 2px; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; margin-bottom: 3px; }
.l-dot { width: 12px; height: 12px; border-radius: 50%; }
.gradient-bar { height: 12px; border-radius: 6px; }
.gradient-labels { display: flex; justify-content: space-between; font-size: 10px; color: #999; }
.tips { margin-top: 16px; font-size: 12px; color: #999; line-height: 1.8; }
.tips p { margin: 0; }
.map-container { flex: 1; height: 100%; }
</style>
