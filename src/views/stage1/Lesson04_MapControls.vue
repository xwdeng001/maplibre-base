<script setup lang="ts">
/**
 * 第04课：地图控件
 * 演示内置控件和自定义控件
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 控件实例引用（用于添加/移除） */
const controlInstances: Record<string, maplibregl.IControl> = {}

/** 控件开关状态 */
const controls = ref([
  { key: 'navigation', name: 'NavigationControl', desc: '缩放和指南针按钮', enabled: true },
  { key: 'scale', name: 'ScaleControl', desc: '比例尺', enabled: true },
  { key: 'fullscreen', name: 'FullscreenControl', desc: '全屏按钮', enabled: false },
  { key: 'geolocate', name: 'GeolocateControl', desc: '定位按钮', enabled: false },
  { key: 'custom', name: '自定义控件', desc: '显示当前坐标和缩放级别', enabled: true }
])

/** 创建自定义控件类 */
class CoordinateControl implements maplibregl.IControl {
  _map: maplibregl.Map | undefined
  _container: HTMLElement | undefined

  onAdd(map: maplibregl.Map) {
    this._map = map
    this._container = document.createElement('div')
    this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group'
    this._container.style.cssText = 'padding:6px 10px;font-size:12px;background:#fff;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.2);'

    const update = () => {
      if (!this._map || !this._container) return
      const c = this._map.getCenter()
      const z = this._map.getZoom()
      this._container.innerHTML = `📍 ${c.lng.toFixed(4)}, ${c.lat.toFixed(4)}<br/>🔍 Zoom: ${z.toFixed(2)}`
    }

    map.on('move', update)
    update()
    return this._container
  }

  onRemove() {
    this._container?.parentNode?.removeChild(this._container)
    this._map = undefined
  }
}

/** 创建控件实例 */
function createControlInstance(key: string): maplibregl.IControl {
  switch (key) {
    case 'navigation':
      return new maplibregl.NavigationControl({ showCompass: true, showZoom: true })
    case 'scale':
      return new maplibregl.ScaleControl({ maxWidth: 150, unit: 'metric' })
    case 'fullscreen':
      return new maplibregl.FullscreenControl()
    case 'geolocate':
      return new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true })
    case 'custom':
      return new CoordinateControl()
    default:
      return new maplibregl.NavigationControl()
  }
}

/** 控件位置映射 */
const controlPositions: Record<string, maplibregl.ControlPosition> = {
  navigation: 'top-right',
  scale: 'bottom-left',
  fullscreen: 'top-right',
  geolocate: 'top-right',
  custom: 'bottom-right'
}

/** 切换控件 */
function toggleControl(ctrl: typeof controls.value[0]) {
  if (!map) return
  if (ctrl.enabled) {
    /** 添加控件 */
    const instance = createControlInstance(ctrl.key)
    controlInstances[ctrl.key] = instance
    map.addControl(instance, controlPositions[ctrl.key])
  } else {
    /** 移除控件 */
    const instance = controlInstances[ctrl.key]
    if (instance) {
      map.removeControl(instance)
      delete controlInstances[ctrl.key]
    }
  }
}

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.39, 39.91],
    zoom: 10,
    attributionControl: false  // 禁用默认的归属控件
  })

  // 手动添加自定义归属
  const attribution = new maplibregl.AttributionControl({
    compact: true,                              // 折叠模式
    customAttribution: '© JuliusDeng的地图项目666'          // 自定义归属文本
  })

  map.addControl(attribution, 'bottom-right')

  map.on('load', () => {
    /** 添加默认启用的控件 */
    controls.value.filter(c => c.enabled).forEach(c => {
      const instance = createControlInstance(c.key)
      controlInstances[c.key] = instance
      map!.addControl(instance, controlPositions[c.key])
    })
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
      <h3>04. 地图控件</h3>
      <p class="panel-desc">切换开关来添加/移除地图控件</p>

      <a-divider style="margin: 12px 0" />

      <div v-for="ctrl in controls" :key="ctrl.key" class="control-row">
        <div class="control-info">
          <div class="control-name">{{ ctrl.name }}</div>
          <div class="control-desc">{{ ctrl.desc }}</div>
        </div>
        <a-switch v-model:checked="ctrl.enabled" size="small" @change="toggleControl(ctrl)" />
      </div>

      <a-divider style="margin: 16px 0" />

      <a-card size="small" title="控件位置说明">
        <div class="position-grid">
          <div class="pos-cell top-left">top-left</div>
          <div class="pos-cell top-right">top-right</div>
          <div class="pos-cell center">地图</div>
          <div class="pos-cell bottom-left">bottom-left</div>
          <div class="pos-cell bottom-right">bottom-right</div>
        </div>
      </a-card>

      <div class="tips">
        <p>💡 NavigationControl：右上角缩放和指南针</p>
        <p>💡 ScaleControl：左下角比例尺</p>
        <p>💡 自定义控件：右下角实时坐标</p>
        <p>💡 通过 IControl 接口可创建任意自定义控件</p>
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

.panel-desc {
  font-size: 12px;
  color: #999;
  margin: 4px 0 0;
}

.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.control-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.control-desc {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.position-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto;
  gap: 4px;
  font-size: 11px;
  text-align: center;
}

.pos-cell {
  padding: 6px;
  border-radius: 4px;
  background: #f5f5f5;
  color: #666;
}

.pos-cell.center {
  grid-column: 1 / 3;
  background: #e6f7ff;
  color: #1890ff;
  font-weight: 600;
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
