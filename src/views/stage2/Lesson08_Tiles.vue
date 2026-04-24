<script setup lang="ts">
/**
 * 第08课：矢量瓦片与栅格瓦片
 * 演示不同瓦片源的加载与对比
 */
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle, tiandituImgStyle, tiandituTerStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 当前选中的瓦片源 */
const currentTile = ref<string>('tdt-vec')

/** 瓦片源选项 */
const tileOptions = [
  {
    key: 'tdt-vec',
    label: '天地图矢量',
    category: 'raster',
    desc: 'WMTS 栅格瓦片',
    tileSize: 256,
    provider: '天地图'
  },
  {
    key: 'tdt-img',
    label: '天地图影像',
    category: 'raster',
    desc: 'WMTS 栅格瓦片',
    tileSize: 256,
    provider: '天地图'
  },
  {
    key: 'tdt-ter',
    label: '天地图地形',
    category: 'raster',
    desc: 'WMTS 栅格瓦片',
    tileSize: 256,
    provider: '天地图'
  },
  {
    key: 'osm',
    label: 'OpenStreetMap',
    category: 'raster',
    desc: 'XYZ 栅格瓦片',
    tileSize: 256,
    provider: 'OSM'
  },
  {
    key: 'demotiles',
    label: 'MapLibre Demo',
    category: 'vector',
    desc: '矢量瓦片演示',
    tileSize: 512,
    provider: 'MapLibre'
  }
]

/** 样式映射 */
const styleMap: Record<string, StyleSpecification | string> = {
  'tdt-vec': tiandituVecStyle,
  'tdt-img': tiandituImgStyle,
  'tdt-ter': tiandituTerStyle,
  'osm': {
    version: 8,
    sources: {
      'osm': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; <a href="https://www.openstreetmap.org/" target="_blank">OpenStreetMap</a>'
      }
    },
    layers: [
      { id: 'osm-layer', type: 'raster', source: 'osm' }
    ]
  },
  'demotiles': 'https://demotiles.maplibre.org/style.json'
}

/** 当前瓦片信息 */
const currentInfo = ref(tileOptions[0])

/** 地图状态 */
const mapState = ref({ zoom: 10, tileCount: '~' })

/** 切换瓦片源 */
watch(currentTile, (key) => {
  if (!map) return
  const style = styleMap[key]
  if (style) {
    map.setStyle(style as StyleSpecification)
  }
  currentInfo.value = tileOptions.find(o => o.key === key) || tileOptions[0]
})

/** 矢量 vs 栅格对比数据 */
const compareData = [
  { key: '1', dim: '数据格式', vector: 'PBF/MVT（二进制）', raster: 'PNG/JPEG（图片）' },
  { key: '2', dim: '渲染端', vector: '客户端（WebGL）', raster: '服务端' },
  { key: '3', dim: '体积', vector: '小', raster: '大' },
  { key: '4', dim: '样式修改', vector: '✅ 动态修改', raster: '❌ 固定' },
  { key: '5', dim: '交互能力', vector: '✅ 要素级', raster: '❌ 无' },
  { key: '6', dim: '缩放清晰度', vector: '✅ 矢量清晰', raster: '❌ 放大模糊' }
]

const compareColumns = [
  { title: '维度', dataIndex: 'dim', width: 100 },
  { title: '矢量瓦片', dataIndex: 'vector' },
  { title: '栅格瓦片', dataIndex: 'raster' }
]

/** 计算当前缩放级别下的瓦片数 */
function calcTileCount(zoom: number): string {
  const n = Math.pow(4, Math.floor(zoom))
  if (n > 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n > 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.39, 39.91],
    zoom: 10
  })

  map.addControl(new maplibregl.NavigationControl(), 'top-right')

  map.on('move', () => {
    if (!map) return
    const z = map.getZoom()
    mapState.value.zoom = +z.toFixed(2)
    mapState.value.tileCount = calcTileCount(z)
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
      <h3>08. 矢量瓦片与栅格瓦片</h3>
      <p class="panel-desc">瓦片类型对比与切换</p>

      <a-divider style="margin: 12px 0" />

      <!-- 瓦片源切换 -->
      <div class="section-title">切换瓦片源</div>
      <a-radio-group v-model:value="currentTile" class="tile-group">
        <a-radio v-for="opt in tileOptions" :key="opt.key" :value="opt.key" class="tile-radio">
          <span>{{ opt.label }}</span>
          <a-tag :color="opt.category === 'vector' ? 'purple' : 'green'" style="margin-left: 4px; font-size: 10px;">
            {{ opt.category }}
          </a-tag>
        </a-radio>
      </a-radio-group>

      <a-divider style="margin: 12px 0" />

      <!-- 当前瓦片信息 -->
      <a-card size="small" title="当前瓦片信息">
        <div class="tile-info">
          <div>名称：<b>{{ currentInfo.label }}</b></div>
          <div>类型：<a-tag :color="currentInfo.category === 'vector' ? 'purple' : 'green'">{{ currentInfo.category }}</a-tag></div>
          <div>规范：{{ currentInfo.desc }}</div>
          <div>瓦片大小：{{ currentInfo.tileSize }}px</div>
          <div>提供方：{{ currentInfo.provider }}</div>
        </div>
      </a-card>

      <!-- 地图状态 -->
      <a-card size="small" title="瓦片金字塔" style="margin-top: 12px;">
        <div class="tile-info">
          <div>当前缩放：<b>{{ mapState.zoom }}</b></div>
          <div>全球瓦片数：<b>{{ mapState.tileCount }}</b></div>
          <div class="pyramid-formula">
            <code>瓦片总数 = 4<sup>z</sup></code>
          </div>
        </div>
      </a-card>

      <a-divider style="margin: 12px 0" />

      <!-- 矢量 vs 栅格对比 -->
      <div class="section-title">矢量 vs 栅格对比</div>
      <a-table :columns="compareColumns" :data-source="compareData" :pagination="false" size="small" bordered
        :scroll="{ x: true }" />

      <div class="tips">
        <p>💡 矢量瓦片支持动态样式和要素交互</p>
        <p>💡 栅格瓦片适合卫星影像底图</p>
        <p>💡 天地图使用 WMTS 规范</p>
        <p>💡 OSM 使用 XYZ 规范</p>
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
  width: 320px;
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

.tile-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tile-radio {
  font-size: 13px;
}

.tile-info {
  font-size: 12px;
  line-height: 2;
  color: #555;
}

.pyramid-formula {
  margin-top: 4px;
}

.pyramid-formula code {
  font-size: 13px;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 3px;
  color: #722ed1;
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
