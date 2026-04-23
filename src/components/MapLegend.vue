<script setup lang="ts">
import type { PhLevel } from '@/mock/soilData'

defineProps<{
  /** 图例标题 */
  title: string
  /** 等级列表 */
  levels: PhLevel[]
  /** 单位 */
  unit?: string
}>()
</script>

<template>
  <div class="map-legend">
    <div class="legend-title">{{ title }}{{ unit ? `（${unit}）` : '' }}</div>
    <div class="legend-items">
      <div v-for="level in levels" :key="level.label" class="legend-item">
        <span class="legend-color" :style="{ backgroundColor: level.color }"></span>
        <span class="legend-label">{{ level.label }}({{ level.range }})</span>
      </div>
    </div>
    <div class="legend-unit" v-if="unit">单位: {{ unit }}</div>
  </div>
</template>

<style scoped>
.map-legend {
  position: absolute;
  bottom: 30px;
  left: 12px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 140px;
}

.legend-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  border-bottom: 1px solid #eee;
  padding-bottom: 6px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 20px;
  height: 14px;
  border-radius: 2px;
  flex-shrink: 0;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.legend-label {
  font-size: 12px;
  color: #555;
  white-space: nowrap;
}

.legend-unit {
  margin-top: 6px;
  font-size: 11px;
  color: #999;
  border-top: 1px solid #eee;
  padding-top: 4px;
}
</style>
