<script setup lang="ts">
/**
 * 第03课：地图基础操作
 * 演示 flyTo / easeTo / jumpTo / fitBounds 和事件监听
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 事件日志 */
const eventLogs = ref<string[]>([])
const maxLogs = 30

function addLog(msg: string) {
  const time = new Date().toLocaleTimeString()
  eventLogs.value.unshift(`[${time}] ${msg}`)
  if (eventLogs.value.length > maxLogs) {
    eventLogs.value.pop()
  }
}

/** 预设的城市位置 */
const cities = [
  { name: '北京', center: [116.39, 39.91] as [number, number], zoom: 11 },
  { name: '上海', center: [121.47, 31.23] as [number, number], zoom: 11 },
  { name: '广州', center: [113.26, 23.13] as [number, number], zoom: 11 },
  { name: '重庆', center: [106.55, 29.56] as [number, number], zoom: 11 },
  { name: '拉萨', center: [91.17, 29.65] as [number, number], zoom: 12 }
]

/** flyTo 飞行动画 */
function handleFlyTo(city: typeof cities[0]) {
  if (!map) return
  addLog(`flyTo → ${city.name}`)
  map.flyTo({
    center: city.center,
    zoom: city.zoom,
    speed: 1.2,
    curve: 1.5
  })
}

/** easeTo 平滑过渡 */
function handleEaseTo(city: typeof cities[0]) {
  if (!map) return
  addLog(`easeTo → ${city.name}`)
  map.easeTo({
    center: city.center,
    zoom: city.zoom,
    duration: 2000
  })
}

/** jumpTo 瞬间跳转 */
function handleJumpTo(city: typeof cities[0]) {
  if (!map) return
  addLog(`jumpTo → ${city.name}`)
  map.jumpTo({
    center: city.center,
    zoom: city.zoom
  })
}

/** fitBounds 自适应范围 */
function handleFitBounds() {
  if (!map) return
  addLog('fitBounds → 中国全境')
  map.fitBounds(
    [[73.5, 18.2], [135.0, 53.5]],
    { padding: 40, duration: 1500 }
  )
}

/** 旋转 + 倾斜 */
function handleRotate() {
  if (!map) return
  const currentBearing = map.getBearing()
  addLog(`rotateTo → ${(currentBearing + 45).toFixed(0)}°`)
  map.easeTo({
    bearing: currentBearing + 45,
    pitch: 45,
    duration: 1000
  })
}

/** 重置 */
function handleReset() {
  if (!map) return
  addLog('resetNorth')
  map.easeTo({ bearing: 0, pitch: 0, duration: 800 })
}

/** 当前选中城市 */
const selectedCity = ref(0)

/** 当前选中的导航方法 */
const selectedMethod = ref<'flyTo' | 'easeTo' | 'jumpTo'>('flyTo')

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.39, 39.91],
    zoom: 5
  })

  map.addControl(new maplibregl.NavigationControl(), 'bottom-right')

  /** 监听事件并输出日志 */
  map.on('click', (e) => {
    addLog(`click → [${e.lngLat.lng.toFixed(4)}, ${e.lngLat.lat.toFixed(4)}]`)
  })
  map.on('zoomend', () => {
    addLog(`zoomend → level ${map!.getZoom().toFixed(2)}`)
  })
  map.on('moveend', () => {
    const c = map!.getCenter()
    addLog(`moveend → [${c.lng.toFixed(4)}, ${c.lat.toFixed(4)}]`)
  })
  map.on('load', () => {
    addLog('✅ 地图加载完成 (load)')
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
      <h3>03. 地图基础操作</h3>

      <a-divider style="margin: 12px 0" />

      <!-- 城市选择 -->
      <div class="section-title">选择目标城市</div>
      <a-radio-group v-model:value="selectedCity" size="small" style="margin-bottom: 12px">
        <a-radio-button v-for="(city, idx) in cities" :key="idx" :value="idx">
          {{ city.name }}
        </a-radio-button>
      </a-radio-group>

      <!-- 动画方法 -->
      <div class="section-title">导航方法</div>
      <div class="btn-group">
        <a-button :type="selectedMethod === 'flyTo' ? 'primary' : 'default'" size="small"
          @click="selectedMethod = 'flyTo'; handleFlyTo(cities[selectedCity])">
          flyTo（飞行动画）
        </a-button>
        <a-button :type="selectedMethod === 'easeTo' ? 'primary' : 'default'" size="small"
          @click="selectedMethod = 'easeTo'; handleEaseTo(cities[selectedCity])">
          easeTo（平滑过渡）
        </a-button>
        <a-button :type="selectedMethod === 'jumpTo' ? 'primary' : 'default'" size="small"
          @click="selectedMethod = 'jumpTo'; handleJumpTo(cities[selectedCity])">
          jumpTo（瞬间跳转）
        </a-button>
      </div>

      <a-divider style="margin: 12px 0" />

      <div class="section-title">其他操作</div>
      <div class="btn-group">
        <a-button size="small" @click="handleFitBounds">fitBounds（中国全境）</a-button>
        <a-button size="small" @click="handleRotate">旋转 +45° & 倾斜</a-button>
        <a-button size="small" @click="handleReset">重置方向</a-button>
      </div>

      <a-divider style="margin: 12px 0" />

      <!-- 事件日志 -->
      <div class="section-title">事件日志</div>
      <div class="event-log">
        <div v-for="(log, i) in eventLogs" :key="i" class="log-item">{{ log }}</div>
        <div v-if="eventLogs.length === 0" class="log-empty">操作地图后这里会显示事件...</div>
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

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-log {
  background: #1a1a2e;
  border-radius: 6px;
  padding: 10px;
  max-height: 240px;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 11px;
  line-height: 1.6;
}

.log-item {
  color: #8be9fd;
}

.log-empty {
  color: #666;
}

.map-container {
  flex: 1;
  height: 100%;
}
</style>
