<script setup lang="ts">
/**
 * 第05课：地图样式（Style）详解
 * 演示 Style Specification 结构、在线样式 vs 本地样式、动态切换样式
 */
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import type { StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { tiandituVecStyle, tiandituImgStyle, tiandituTerStyle } from '@/utils/mapStyles'

const mapContainer = ref<HTMLElement>()
let map: maplibregl.Map | null = null

/** 当前样式 key */
const currentStyleKey = ref<string>('tdt-vec')

/** 样式选项 */
const styleOptions = [
  { label: '天地图矢量', value: 'tdt-vec', type: '本地对象' },
  { label: '天地图影像', value: 'tdt-img', type: '本地对象' },
  { label: '天地图地形', value: 'tdt-ter', type: '本地对象' },
  { label: 'MapLibre Demo', value: 'demotiles', type: '在线URL' },
  { label: 'OSM Bright', value: 'osm-bright', type: '在线URL' }
]

/** 样式映射表 */
const styleMap: Record<string, StyleSpecification | string> = {
  'tdt-vec': tiandituVecStyle,
  'tdt-img': tiandituImgStyle,
  'tdt-ter': tiandituTerStyle,
  'demotiles': 'https://demotiles.maplibre.org/style.json',
  'osm-bright': 'https://tiles.openfreemap.org/styles/bright'
}

/** 当前样式的 JSON 预览 */
const styleJson = ref<string>('')

/** 更新样式 JSON 预览 */
function updateStylePreview() {
  if (!map) return
  try {
    const style = map.getStyle()
    /** 只显示核心字段 */
    const preview = {
      version: style.version,
      name: style.name || '(未命名)',
      sources: Object.keys(style.sources || {}),
      layers: (style.layers || []).map(l => `${l.id} (${l.type})`),
      glyphs: style.glyphs || '(未设置)',
      sprite: style.sprite || '(未设置)'
    }
    styleJson.value = JSON.stringify(preview, null, 2)
  } catch {
    styleJson.value = '(样式加载中...)'
  }
}

/** 切换样式 */
watch(currentStyleKey, (key) => {
  if (!map) return
  const style = styleMap[key]
  if (style) {
    map.setStyle(style as StyleSpecification)
  }
})

/** Style 结构说明数据 */
const styleFields = [
  { field: 'version', required: true, desc: '样式规范版本，固定为 8' },
  { field: 'sources', required: true, desc: '数据源定义对象' },
  { field: 'layers', required: true, desc: '图层数组，控制渲染顺序和样式' },
  { field: 'glyphs', required: false, desc: '字体 PBF 文件 URL 模板' },
  { field: 'sprite', required: false, desc: '雪碧图 URL 前缀' },
  { field: 'name', required: false, desc: '样式名称，仅用于标识' },
  { field: 'center', required: false, desc: '默认中心点 [lng, lat]' },
  { field: 'zoom', required: false, desc: '默认缩放级别' }
]

function initMap() {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: tiandituVecStyle,
    center: [116.39, 39.91],
    zoom: 10
  })

  map.on('style.load', () => {
    updateStylePreview()
  })

  map.on('load', () => {
    updateStylePreview()
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
      <h3>05. 地图样式详解</h3>
      <p class="panel-desc">Style Specification 结构与动态切换</p>

      <a-divider style="margin: 12px 0" />

      <!-- 样式切换 -->
      <div class="section-title">切换样式</div>
      <a-radio-group v-model:value="currentStyleKey" class="style-radio-group">
        <a-radio v-for="opt in styleOptions" :key="opt.value" :value="opt.value" class="style-radio">
          {{ opt.label }}
          <a-tag :color="opt.type === '在线URL' ? 'blue' : 'green'" style="margin-left: 4px; font-size: 10px;">
            {{ opt.type }}
          </a-tag>
        </a-radio>
      </a-radio-group>

      <a-divider style="margin: 12px 0" />

      <!-- Style 结构说明 -->
      <div class="section-title">Style Specification 字段</div>
      <div class="field-list">
        <div v-for="f in styleFields" :key="f.field" class="field-item">
          <code class="field-name">{{ f.field }}</code>
          <a-tag v-if="f.required" color="red" style="font-size: 10px;">必需</a-tag>
          <a-tag v-else color="default" style="font-size: 10px;">可选</a-tag>
          <div class="field-desc">{{ f.desc }}</div>
        </div>
      </div>

      <a-divider style="margin: 12px 0" />

      <!-- 当前样式预览 -->
      <div class="section-title">当前样式摘要</div>
      <pre class="style-preview">{{ styleJson }}</pre>

      <div class="tips">
        <p>💡 setStyle 会清除运行时添加的图层</p>
        <p>💡 本地对象样式更灵活，在线 URL 更简洁</p>
        <p>💡 Maputnik 是优秀的可视化样式编辑器</p>
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

.style-radio-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.style-radio {
  font-size: 13px;
}

.field-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-item {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.field-name {
  font-size: 12px;
  background: #f5f5f5;
  padding: 1px 6px;
  border-radius: 3px;
  color: #d4380d;
}

.field-desc {
  width: 100%;
  font-size: 11px;
  color: #888;
  margin-top: 2px;
}

.style-preview {
  font-size: 11px;
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 8px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
  margin: 0;
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
