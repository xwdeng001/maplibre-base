<script setup lang="ts">
/**
 * 第16课：Popup 弹窗
 * 演示 Popup 创建、样式自定义、事件处理
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null
let activePopup: maplibregl.Popup | null = null

/** Popup 配置 */
const popupConfig = ref({
  closeButton: true,
  closeOnClick: true,
  maxWidth: '240px',
  anchor: 'bottom' as maplibregl.PositionAnchor | undefined
})

/** 弹窗状态 */
const popupStatus = ref('无弹窗')

/** 示例地点 */
const locations = [
  { lng: 116.3912, lat: 39.9073, name: '天安门', desc: '位于北京中心，中华人民共和国的象征', type: 'html' },
  { lng: 116.3974, lat: 39.9163, name: '故宫', desc: '世界上现存规模最大的宫殿建筑群', type: 'html' },
  { lng: 116.4074, lat: 39.8887, name: '天坛', desc: '明清两代皇帝祭天的场所', type: 'dom' }
]

/** 创建 HTML Popup */
function showHtmlPopup(loc: typeof locations[0]) {
  if (!map) return
  if (activePopup) activePopup.remove()

  activePopup = new maplibregl.Popup({
    offset: 15,
    closeButton: popupConfig.value.closeButton,
    closeOnClick: popupConfig.value.closeOnClick,
    maxWidth: popupConfig.value.maxWidth
  })
    .setLngLat([loc.lng, loc.lat])
    .setHTML(`
      <div style="font-family: sans-serif;">
        <h3 style="margin:0 0 6px;font-size:15px;color:#1890ff;">${loc.name}</h3>
        <p style="margin:0;font-size:13px;color:#666;">${loc.desc}</p>
        <p style="margin:6px 0 0;font-size:11px;color:#999;">📍 ${loc.lng}, ${loc.lat}</p>
      </div>
    `)
    .addTo(map)

  activePopup.on('close', () => { popupStatus.value = '弹窗已关闭' })
  popupStatus.value = `显示: ${loc.name}`
  map.flyTo({ center: [loc.lng, loc.lat], zoom: 13, duration: 800 })
}

/** 创建 DOM Popup */
function showDomPopup(loc: typeof locations[0]) {
  if (!map) return
  if (activePopup) activePopup.remove()

  const container = document.createElement('div')
  container.style.cssText = 'padding:4px;font-family:sans-serif;'

  const title = document.createElement('h3')
  title.textContent = loc.name
  title.style.cssText = 'margin:0 0 6px;font-size:15px;color:#722ed1;'

  const desc = document.createElement('p')
  desc.textContent = loc.desc
  desc.style.cssText = 'margin:0;font-size:13px;color:#666;'

  const btn = document.createElement('button')
  btn.textContent = '查看详情'
  btn.style.cssText = 'margin-top:8px;padding:4px 12px;background:#722ed1;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;'
  btn.onclick = () => { popupStatus.value = `点击了「${loc.name}」的详情按钮` }

  container.append(title, desc, btn)

  activePopup = new maplibregl.Popup({ offset: 15, closeButton: true, maxWidth: '260px' })
    .setLngLat([loc.lng, loc.lat])
    .setDOMContent(container)
    .addTo(map)

  activePopup.on('close', () => { popupStatus.value = '弹窗已关闭' })
  popupStatus.value = `显示: ${loc.name} (DOM)`
  map.flyTo({ center: [loc.lng, loc.lat], zoom: 13, duration: 800 })
}

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.39, 39.91],
    zoom: 11
  })

  /** 添加默认 Marker */
  map.on('load', () => {
    locations.forEach(loc => {
      new maplibregl.Marker({ color: loc.type === 'dom' ? '#722ed1' : '#1890ff' })
        .setLngLat([loc.lng, loc.lat])
        .addTo(map!)
    })
  })
}

onMounted(() => initMap())
onBeforeUnmount(() => {
  if (activePopup) activePopup.remove()
  if (map) { map.remove(); map = null }
})
</script>

<template>
  <div class="lesson-page">
    <div class="control-panel">
      <h3>16. Popup 弹窗</h3>
      <p class="panel-desc">HTML / DOM 弹窗与事件处理</p>

      <a-divider style="margin: 12px 0" />

      <div class="section-title">点击显示 Popup</div>
      <div v-for="loc in locations" :key="loc.name" class="loc-btn"
        @click="loc.type === 'dom' ? showDomPopup(loc) : showHtmlPopup(loc)">
        <a-tag :color="loc.type === 'dom' ? 'purple' : 'blue'" style="font-size: 10px;">{{ loc.type === 'dom' ? 'DOM' : 'HTML' }}</a-tag>
        {{ loc.name }}
      </div>

      <a-divider style="margin: 12px 0" />

      <div class="section-title">Popup 配置</div>
      <div class="config-row">
        <span>closeButton</span>
        <a-switch v-model:checked="popupConfig.closeButton" size="small" />
      </div>
      <div class="config-row">
        <span>closeOnClick</span>
        <a-switch v-model:checked="popupConfig.closeOnClick" size="small" />
      </div>

      <a-divider style="margin: 12px 0" />

      <a-card size="small" title="弹窗状态">
        <div style="font-size: 13px;">{{ popupStatus }}</div>
      </a-card>

      <div class="tips">
        <p>💡 setHTML 适合简单内容</p>
        <p>💡 setDOMContent 支持交互元素</p>
        <p>💡 className 自定义弹窗样式</p>
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
.loc-btn { padding: 8px; border: 1px solid #e8e8e8; border-radius: 6px; margin-bottom: 6px; cursor: pointer; font-size: 13px; transition: all .2s; }
.loc-btn:hover { border-color: #1890ff; background: #e6f7ff; }
.config-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
.tips { margin-top: 16px; font-size: 12px; color: #999; line-height: 1.8; }
.tips p { margin: 0; }
.map-container { flex: 1; height: 100%; }
</style>
