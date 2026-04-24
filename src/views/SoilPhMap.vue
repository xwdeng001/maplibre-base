<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituImgStyle } from '@/utils/mapStyles'
import MapLegend from '@/components/MapLegend.vue'
import MapFilter from '@/components/MapFilter.vue'
import type { FilterState } from '@/components/MapFilter.vue'
import {
  generateMockSoilData,
  INDICATOR_CONFIGS,
  getColorByValue,
  type SoilIndicator,
  type PlotProperties
} from '@/mock/soilData'

/** 地图容器引用 */
const mapContainer = ref<HTMLElement>()
/** MapLibre 地图实例 */
let map: maplibregl.Map | null = null
/** 当前弹窗 */
let currentPopup: maplibregl.Popup | null = null

/** 当前选中的指标 */
const currentIndicator = ref<SoilIndicator>('pH')
/** 当前筛选条件 */
const currentFilter = ref<FilterState>({
  city: '',
  county: '',
  town: '',
  village: ''
})

/** 当前指标配置 */
const currentConfig = ref(INDICATOR_CONFIGS[0])

/** 原始数据 */
const soilData = generateMockSoilData()

/** 根据筛选条件过滤数据 */
function getFilteredData() {
  const filtered = soilData.features.filter((f: any) => {
    const p = f.properties
    if (currentFilter.value.city && p.city !== currentFilter.value.city) return false
    if (currentFilter.value.county && p.county !== currentFilter.value.county) return false
    if (currentFilter.value.town && p.town !== currentFilter.value.town) return false
    if (currentFilter.value.village && p.village !== currentFilter.value.village) return false
    return true
  })
  return { type: 'FeatureCollection' as const, features: filtered }
}

/** 根据指标值为每个要素计算颜色 */
function getFeatureColor(properties: PlotProperties): string {
  const config = INDICATOR_CONFIGS.find(c => c.key === currentIndicator.value)!
  const value = properties[currentIndicator.value] as number
  return getColorByValue(value, config.levels)
}

/** 生成标注数据（每个多边形的中心点） */
function generateLabelData() {
  const filtered = getFilteredData()
  return {
    type: 'FeatureCollection' as const,
    features: filtered.features.map((f: any) => {
      /** 计算多边形中心 */
      const coords = f.geometry.coordinates[0] as number[][]
      const lngSum = coords.reduce((sum: number, c: number[]) => sum + c[0], 0)
      const latSum = coords.reduce((sum: number, c: number[]) => sum + c[1], 0)
      const center = [lngSum / coords.length, latSum / coords.length]

      return {
        type: 'Feature' as const,
        properties: {
          ...f.properties,
          labelText: `${f.properties.name}\n土壤检测日期\n${f.properties.testDate}`
        },
        geometry: {
          type: 'Point' as const,
          coordinates: center
        }
      }
    })
  }
}

/** 更新地图数据源 */
function updateMapData() {
  if (!map) return

  const filteredData = getFilteredData()

  /** 为每个要素添加颜色属性 */
  const coloredFeatures = filteredData.features.map((f: any) => ({
    ...f,
    properties: {
      ...f.properties,
      fillColor: getFeatureColor(f.properties)
    }
  }))

  const coloredData = {
    type: 'FeatureCollection' as const,
    features: coloredFeatures
  }

  /** 更新多边形数据源 */
  const polygonSource = map.getSource('soil-polygons') as maplibregl.GeoJSONSource
  if (polygonSource) {
    polygonSource.setData(coloredData as any)
  }

  /** 更新标注数据源 */
  const labelSource = map.getSource('soil-labels') as maplibregl.GeoJSONSource
  if (labelSource) {
    labelSource.setData(generateLabelData() as any)
  }

  /** 如果有筛选且有数据，飞行到数据范围 */
  if (coloredFeatures.length > 0 && (currentFilter.value.town || currentFilter.value.village)) {
    const bounds = new maplibregl.LngLatBounds()
    coloredFeatures.forEach((f: any) => {
      f.geometry.coordinates[0].forEach((coord: number[]) => {
        bounds.extend(coord as [number, number])
      })
    })
    map.fitBounds(bounds, { padding: 80, duration: 1000 })
  }
}

/** 初始化地图 */
function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituImgStyle,
    center: [103.15, 24.92],
    zoom: 13,
    maxZoom: 18,
    minZoom: 5
  })

  /** 添加导航控件 */
  map.addControl(new maplibregl.NavigationControl(), 'bottom-right')

  map.on('load', () => {
    addSoilLayers()
    updateMapData()
  })
}

/** 添加土壤数据图层 */
function addSoilLayers() {
  if (!map) return

  /** 添加多边形数据源 */
  map.addSource('soil-polygons', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  })

  /** 添加标注数据源 */
  map.addSource('soil-labels', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  })

  /** 多边形填充图层 */
  map.addLayer({
    id: 'soil-fill',
    type: 'fill',
    source: 'soil-polygons',
    paint: {
      'fill-color': ['get', 'fillColor'],
      'fill-opacity': 0.65
    }
  })

  /** 多边形边框图层 */
  map.addLayer({
    id: 'soil-outline',
    type: 'line',
    source: 'soil-polygons',
    paint: {
      'line-color': '#fff',
      'line-width': 2,
      'line-opacity': 0.8
    }
  })

  /** 标注图层 */
  map.addLayer({
    id: 'soil-labels',
    type: 'symbol',
    source: 'soil-labels',
    layout: {
      'text-field': ['get', 'labelText'],
      'text-size': 12,
      'text-anchor': 'center',
      'text-allow-overlap': true,
      'text-ignore-placement': true
    },
    paint: {
      'text-color': '#fff',
      'text-halo-color': 'rgba(0,0,0,0.6)',
      'text-halo-width': 1.5
    }
  })

  /** 悬停高亮 */
  map.on('mouseenter', 'soil-fill', () => {
    if (map) map.getCanvas().style.cursor = 'pointer'
  })

  map.on('mouseleave', 'soil-fill', () => {
    if (map) map.getCanvas().style.cursor = ''
  })

  /** 点击弹出详情 */
  map.on('click', 'soil-fill', (e) => {
    if (!e.features || e.features.length === 0) return

    const props = e.features[0].properties as PlotProperties
    const lngLat = e.lngLat

    /** 关闭已有弹窗 */
    if (currentPopup) {
      currentPopup.remove()
    }

    const html = `
      <div style="font-size:13px;line-height:1.6;min-width:180px;">
        <div style="font-weight:600;font-size:14px;margin-bottom:6px;color:#333;border-bottom:1px solid #eee;padding-bottom:4px;">
          ${props.name}
        </div>
        <div style="color:#666;">
          <div>📍 ${props.city} ${props.county} ${props.town} ${props.village}</div>
          <div>📅 检测日期: ${props.testDate}</div>
          <div>📐 面积: ${props.area} 亩</div>
          <div style="margin-top:4px;border-top:1px solid #eee;padding-top:4px;">
            <div>🧪 pH值: <b>${props.pH}</b></div>
            <div>🌱 有机质: <b>${props.organicMatter}</b> g/kg</div>
            <div>💧 速效氮: <b>${props.availableN}</b> mg/kg</div>
            <div>🔬 速效磷: <b>${props.availableP}</b> mg/kg</div>
            <div>⚗️ 速效钾: <b>${props.availableK}</b> mg/kg</div>
          </div>
        </div>
      </div>
    `

    currentPopup = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
      maxWidth: '280px'
    })
      .setLngLat(lngLat)
      .setHTML(html)
      .addTo(map!)
  })
}

/** 处理筛选变更 */
function handleFilterChange(filters: FilterState) {
  currentFilter.value = filters
  updateMapData()
}

/** 处理指标切换 */
function handleIndicatorChange(indicator: SoilIndicator) {
  currentIndicator.value = indicator
  currentConfig.value = INDICATOR_CONFIGS.find(c => c.key === indicator)!
  updateMapData()
}

onMounted(() => {
  initMap()
})

onBeforeUnmount(() => {
  if (currentPopup) {
    currentPopup.remove()
  }
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="soil-ph-map">
    <!-- 地图容器 -->
    <div ref="mapContainer" class="map-container"></div>

    <!-- 筛选栏 -->
    <MapFilter @filter-change="handleFilterChange" @indicator-change="handleIndicatorChange" />

    <!-- 图例 -->
    <MapLegend :title="currentConfig.label + '值等级'" :levels="currentConfig.levels"
      :unit="currentConfig.unit || undefined" />
  </div>
</template>

<style scoped>
.soil-ph-map {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
}
</style>
