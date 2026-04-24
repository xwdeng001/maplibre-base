<script setup lang="ts">
/**
 * 第21课：图层过滤 Filter
 * 演示按属性筛选、组合条件、动态修改 filter
 */
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 筛选条件 */
const filterType = ref<string[]>(['景点', '公园', '商业', '交通'])
const filterMinValue = ref(0)
const filterLogic = ref<'all' | 'any'>('all')

/** 可见要素数 */
const visibleCount = ref(0)

const allTypes = ['景点', '公园', '商业', '交通']
const typeColors: Record<string, string> = { '景点': '#1890ff', '公园': '#52c41a', '商业': '#fa8c16', '交通': '#722ed1' }

/** 生成数据 */
function generateData(): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = []
  for (let i = 0; i < 80; i++) {
    const type = allTypes[Math.floor(Math.random() * allTypes.length)]
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [116.2 + Math.random() * 0.35, 39.82 + Math.random() * 0.18] },
      properties: { name: `${type}${i + 1}`, type, value: Math.floor(Math.random() * 100) }
    })
  }
  return { type: 'FeatureCollection', features }
}

const pointsData = generateData()

/** 构建 filter 表达式 */
function buildFilter(): any[] | null {
  const conditions: any[] = []

  /** 类型筛选 */
  if (filterType.value.length > 0 && filterType.value.length < allTypes.length) {
    conditions.push(['in', ['get', 'type'], ['literal', filterType.value]])
  }

  /** 数值筛选 */
  if (filterMinValue.value > 0) {
    conditions.push(['>=', ['get', 'value'], filterMinValue.value])
  }

  if (conditions.length === 0) return null
  if (conditions.length === 1) return conditions[0]
  return [filterLogic.value, ...conditions]
}

/** 更新 filter */
function updateFilter() {
  if (!map?.getLayer('filter-circle')) return
  const filter = buildFilter()
  map.setFilter('filter-circle', filter as any)
  map.setFilter('filter-label', filter as any)

  /** 计算可见数 */
  setTimeout(() => {
    const features = map!.queryRenderedFeatures(undefined, { layers: ['filter-circle'] })
    visibleCount.value = features.length
  }, 100)
}

watch([filterType, filterMinValue, filterLogic], updateFilter, { deep: true })

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.39, 39.91],
    zoom: 11
  })

  map.on('load', () => {
    map!.addSource('filter-data', { type: 'geojson', data: pointsData })

    map!.addLayer({
      id: 'filter-circle', type: 'circle', source: 'filter-data',
      paint: {
        'circle-radius': 7,
        'circle-color': ['match', ['get', 'type'], '景点', '#1890ff', '公园', '#52c41a', '商业', '#fa8c16', '交通', '#722ed1', '#999'],
        'circle-stroke-width': 2, 'circle-stroke-color': '#fff', 'circle-opacity': 0.85
      }
    })

    map!.addLayer({
      id: 'filter-label', type: 'symbol', source: 'filter-data',
      layout: { 'text-field': ['get', 'name'], 'text-size': 10, 'text-offset': [0, 1.3], 'text-anchor': 'top' },
      paint: { 'text-color': '#555', 'text-halo-color': '#fff', 'text-halo-width': 1 },
      minzoom: 13
    })

    visibleCount.value = pointsData.features.length

    map!.on('click', 'filter-circle', (e) => {
      if (!e.features?.[0]) return
      const p = e.features[0].properties
      new maplibregl.Popup({ offset: 10, closeButton: false }).setLngLat(e.lngLat)
        .setHTML(`<b>${p?.name}</b><br/>类型: ${p?.type}<br/>数值: ${p?.value}`).addTo(map!)
    })
    map!.on('mouseenter', 'filter-circle', () => { map!.getCanvas().style.cursor = 'pointer' })
    map!.on('mouseleave', 'filter-circle', () => { map!.getCanvas().style.cursor = '' })
  })
}

onMounted(() => initMap())
onBeforeUnmount(() => { if (map) { map.remove(); map = null } })
</script>

<template>
  <div class="lesson-page">
    <div class="control-panel">
      <h3>21. 图层过滤 Filter</h3>
      <p class="panel-desc">按属性筛选与组合条件</p>

      <a-divider style="margin: 12px 0" />

      <!-- 类型筛选 -->
      <div class="section-title">按类型筛选</div>
      <a-checkbox-group v-model:value="filterType" class="type-checks">
        <a-checkbox v-for="t in allTypes" :key="t" :value="t">
          <span class="type-dot" :style="{ background: typeColors[t] }"></span> {{ t }}
        </a-checkbox>
      </a-checkbox-group>

      <a-divider style="margin: 12px 0" />

      <!-- 数值筛选 -->
      <div class="section-title">按数值筛选（≥）</div>
      <div class="control-row">
        <a-slider v-model:value="filterMinValue" :min="0" :max="100" style="width: 180px" />
        <span class="value">{{ filterMinValue }}</span>
      </div>

      <!-- 组合逻辑 -->
      <div class="section-title">组合逻辑</div>
      <a-radio-group v-model:value="filterLogic" size="small" option-type="button">
        <a-radio-button value="all">all（全部满足）</a-radio-button>
        <a-radio-button value="any">any（任一满足）</a-radio-button>
      </a-radio-group>

      <a-divider style="margin: 12px 0" />

      <a-card size="small" title="筛选结果">
        <div style="font-size: 13px;">
          <div>总数据: <b>{{ pointsData.features.length }}</b></div>
          <div>可见: <b style="color:#1890ff;">{{ visibleCount }}</b></div>
        </div>
      </a-card>

      <div class="tips">
        <p>💡 filter 只影响显示，不影响数据</p>
        <p>💡 all = AND，any = OR</p>
        <p>💡 setFilter(null) 移除过滤</p>
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
.type-checks { display: flex; flex-direction: column; gap: 4px; }
.type-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 2px; }
.control-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.control-row .value { font-size: 13px; color: #1890ff; font-weight: 500; }
.tips { margin-top: 16px; font-size: 12px; color: #999; line-height: 1.8; }
.tips p { margin: 0; }
.map-container { flex: 1; height: 100%; }
</style>
