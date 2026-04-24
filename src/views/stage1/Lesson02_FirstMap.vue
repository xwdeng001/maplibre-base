<script setup lang="ts">
/**
 * 第02课：环境搭建与第一张地图
 * 展示 MapLibre Map 构造函数核心参数及其效果
 */
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { MAP_STYLE_OPTIONS, getMapStyleByKey, type MapStyleKey } from '@/utils/mapStyles'

/** 地图容器 */
const mapContainer = ref<HTMLElement>()
/** 地图实例 */
let map: maplibregl.Map | null = null

/** 可调参数 */
const center = ref({ lng: 116.39, lat: 39.91 })
const zoom = ref(10)
const bearing = ref(0)
const pitch = ref(0)

/** 底图样式选项（来自统一配置） */
const styleOptions = MAP_STYLE_OPTIONS
const currentStyle = ref<MapStyleKey>('vec')

/** 初始化地图 */
function initMap() {
  if (!mapContainer.value) return
  map = new maplibregl.Map({
    container: mapContainer.value,
    style: getMapStyleByKey(currentStyle.value),
    center: [center.value.lng, center.value.lat],
    zoom: zoom.value,
    bearing: bearing.value,
    pitch: pitch.value,
    maxZoom: 18,
    minZoom: 2
  })

  /** 同步地图状态到控制面板 */
  map.on('move', () => {
    if (!map) return
    const c = map.getCenter()
    center.value.lng = +c.lng.toFixed(4)
    center.value.lat = +c.lat.toFixed(4)
    zoom.value = +map.getZoom().toFixed(2)
    bearing.value = +map.getBearing().toFixed(1)
    pitch.value = +map.getPitch().toFixed(1)
  })
}

/** 底图切换 */
watch(currentStyle, (val) => {
  if (map) {
    map.setStyle(getMapStyleByKey(val))
  }
})

/** 重置视角 */
function resetView() {
  if (!map) return
  map.flyTo({
    center: [116.39, 39.91],
    zoom: 10,
    bearing: 0,
    pitch: 0,
    duration: 1500
  })
}

onMounted(() => initMap())

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div class="lesson-page">
    <!-- 控制面板 -->
    <div class="control-panel">
      <h3>02. 第一张地图 — Map 构造参数</h3>

      <a-divider style="margin: 12px 0" />

      <div class="control-item">
        <span class="label">底图样式</span>
        <a-radio-group v-model:value="currentStyle" :options="styleOptions" size="small" option-type="button" />
      </div>

      <div class="control-item">
        <span class="label">中心经度 (lng)</span>
        <a-input-number v-model:value="center.lng" :step="0.01" :precision="4" size="small" style="width:120px" disabled />
      </div>

      <div class="control-item">
        <span class="label">中心纬度 (lat)</span>
        <a-input-number v-model:value="center.lat" :step="0.01" :precision="4" size="small" style="width:120px" disabled />
      </div>

      <div class="control-item">
        <span class="label">缩放级别 (zoom)</span>
        <a-slider v-model:value="zoom" :min="2" :max="18" :step="0.1" style="width:160px" disabled />
        <span class="value">{{ zoom }}</span>
      </div>

      <div class="control-item">
        <span class="label">旋转角度 (bearing)</span>
        <span class="value">{{ bearing }}°</span>
      </div>

      <div class="control-item">
        <span class="label">倾斜角度 (pitch)</span>
        <span class="value">{{ pitch }}°</span>
      </div>

      <a-divider style="margin: 12px 0" />

      <a-button type="primary" size="small" block @click="resetView">重置视角</a-button>

      <div class="tips">
        <p>💡 拖拽地图查看参数实时变化</p>
        <p>💡 右键拖拽可旋转和倾斜</p>
        <p>💡 滚轮缩放地图</p>
      </div>
    </div>

    <!-- 地图容器 -->
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<style scoped>
.lesson-page {
  height: 100%;
  display: flex;
  position: relative;
}

.control-panel {
  width: 300px;
  flex-shrink: 0;
  background: #fff;
  padding: 16px;
  overflow-y: auto;
  border-right: 1px solid #e8e8e8;
  z-index: 2;
}

.control-panel h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.control-item .label {
  font-size: 13px;
  color: #555;
  min-width: 110px;
}

.control-item .value {
  font-size: 13px;
  color: #1890ff;
  font-weight: 500;
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
