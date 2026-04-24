<script setup lang="ts">
/**
 * 第15课：Marker 标记点
 * 演示 Marker 创建、自定义 DOM、拖拽、Popup 联动
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null
const markers: maplibregl.Marker[] = []

/** 拖拽位置 */
const dragPosition = ref({ lng: 116.39, lat: 39.91 })

/** Marker 数据 */
const markerData = [
  { lng: 116.3912, lat: 39.9073, label: '天安门', color: '#f5222d', emoji: '🏛️' },
  { lng: 116.3974, lat: 39.9163, label: '故宫', color: '#fa8c16', emoji: '🏯' },
  { lng: 116.4074, lat: 39.8887, label: '天坛', color: '#52c41a', emoji: '⛩️' },
  { lng: 116.2731, lat: 39.9998, label: '颐和园', color: '#1890ff', emoji: '🌳' },
  { lng: 116.3913, lat: 39.9340, label: '鼓楼', color: '#722ed1', emoji: '🏗️' }
]

/** 显示模式 */
const markerMode = ref<'default' | 'custom' | 'draggable'>('default')

/** 清除所有 marker */
function clearMarkers() {
  markers.forEach(m => m.remove())
  markers.length = 0
}

/** 添加默认 Marker */
function addDefaultMarkers() {
  clearMarkers()
  markerData.forEach(d => {
    const popup = new maplibregl.Popup({ offset: 25, closeButton: false })
      .setHTML(`<b>${d.label}</b><br/>坐标: ${d.lng}, ${d.lat}`)

    const marker = new maplibregl.Marker({ color: d.color })
      .setLngLat([d.lng, d.lat])
      .setPopup(popup)
      .addTo(map!)

    markers.push(marker)
  })
}

/** 添加自定义 DOM Marker */
function addCustomMarkers() {
  clearMarkers()
  markerData.forEach(d => {
    const el = document.createElement('div')
    el.style.cssText = 'font-size:28px;cursor:pointer;transition:transform .2s;'
    el.innerHTML = d.emoji
    el.title = d.label
    el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.3)' })
    el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })

    const popup = new maplibregl.Popup({ offset: 20, closeButton: false })
      .setHTML(`<b>${d.emoji} ${d.label}</b>`)

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([d.lng, d.lat])
      .setPopup(popup)
      .addTo(map!)

    markers.push(marker)
  })
}

/** 添加可拖拽 Marker */
function addDraggableMarker() {
  clearMarkers()
  const marker = new maplibregl.Marker({ draggable: true, color: '#f5222d' })
    .setLngLat([116.39, 39.91])
    .addTo(map!)

  marker.on('dragend', () => {
    const pos = marker.getLngLat()
    dragPosition.value = { lng: +pos.lng.toFixed(4), lat: +pos.lat.toFixed(4) }
  })

  markers.push(marker)
  dragPosition.value = { lng: 116.39, lat: 39.91 }
}

/** 切换模式 */
function switchMode() {
  if (!map) return
  switch (markerMode.value) {
    case 'default': addDefaultMarkers(); break
    case 'custom': addCustomMarkers(); break
    case 'draggable': addDraggableMarker(); break
  }
}

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.39, 39.91],
    zoom: 11
  })

  map.on('load', () => addDefaultMarkers())
}

onMounted(() => initMap())
onBeforeUnmount(() => {
  clearMarkers()
  if (map) { map.remove(); map = null }
})
</script>

<template>
  <div class="lesson-page">
    <div class="control-panel">
      <h3>15. Marker 标记点</h3>
      <p class="panel-desc">DOM 覆盖物、自定义、拖拽</p>

      <a-divider style="margin: 12px 0" />

      <div class="section-title">Marker 模式</div>
      <a-radio-group v-model:value="markerMode" @change="switchMode" size="small" option-type="button">
        <a-radio-button value="default">默认颜色</a-radio-button>
        <a-radio-button value="custom">自定义DOM</a-radio-button>
        <a-radio-button value="draggable">可拖拽</a-radio-button>
      </a-radio-group>

      <a-divider style="margin: 12px 0" />

      <template v-if="markerMode === 'default'">
        <a-card size="small" title="Marker 列表">
          <div v-for="d in markerData" :key="d.label" class="marker-item">
            <span class="marker-dot" :style="{ background: d.color }"></span>
            <span>{{ d.label }}</span>
          </div>
        </a-card>
      </template>

      <template v-if="markerMode === 'custom'">
        <a-card size="small" title="自定义 Emoji Marker">
          <div v-for="d in markerData" :key="d.label" class="marker-item">
            <span>{{ d.emoji }} {{ d.label }}</span>
          </div>
        </a-card>
      </template>

      <template v-if="markerMode === 'draggable'">
        <a-card size="small" title="拖拽位置">
          <div style="font-size: 13px; line-height: 2;">
            <div>经度: <b>{{ dragPosition.lng }}</b></div>
            <div>纬度: <b>{{ dragPosition.lat }}</b></div>
          </div>
        </a-card>
        <p style="font-size: 12px; color: #fa8c16; margin-top: 8px;">拖动红色 Marker 查看坐标变化</p>
      </template>

      <div class="tips">
        <p>💡 点击 Marker 显示 Popup 弹窗</p>
        <p>💡 自定义 DOM 支持任意 HTML</p>
        <p>💡 Marker 是 DOM 元素，不走 WebGL</p>
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
.marker-item { display: flex; align-items: center; gap: 6px; font-size: 13px; margin-bottom: 4px; }
.marker-dot { width: 12px; height: 12px; border-radius: 50%; }
.tips { margin-top: 16px; font-size: 12px; color: #999; line-height: 1.8; }
.tips p { margin: 0; }
.map-container { flex: 1; height: 100%; }
</style>
