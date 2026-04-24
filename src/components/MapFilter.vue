<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { REGIONS, INDICATOR_CONFIGS, type SoilIndicator } from '@/mock/soilData'

const emit = defineEmits<{
  /** 筛选条件变更 */
  (e: 'filter-change', filters: FilterState): void
  /** 指标切换 */
  (e: 'indicator-change', indicator: SoilIndicator): void
}>()

export interface FilterState {
  city: string
  county: string
  town: string
  village: string
}

/** 当前选中的筛选条件 */
const selectedCity = ref('')
const selectedCounty = ref('')
const selectedTown = ref('')
const selectedVillage = ref('')
const selectedIndicator = ref<SoilIndicator>('pH')
/** 指标下拉菜单是否展开 */
const showIndicatorDropdown = ref(false)

/** 城市列表 */
const cities = computed(() => REGIONS.cities)

/** 县区列表 */
const counties = computed(() => {
  if (!selectedCity.value) return []
  return ((REGIONS.counties as unknown) as Record<string, string[]>)[selectedCity.value] || []
})

/** 乡镇列表 */
const towns = computed(() => {
  if (!selectedCounty.value) return []
  return ((REGIONS.towns as unknown) as Record<string, string[]>)[selectedCounty.value] || []
})

/** 村列表 */
const villages = computed(() => {
  if (!selectedTown.value) return []
  return ((REGIONS.villages as unknown) as Record<string, string[]>)[selectedTown.value] || []
})

/** 当前选中的指标配置 */
const currentIndicatorLabel = computed(() => {
  const config = INDICATOR_CONFIGS.find(c => c.key === selectedIndicator.value)
  return config?.label || 'pH'
})

/** 监听筛选变化 */
watch([selectedCity, selectedCounty, selectedTown, selectedVillage], () => {
  emit('filter-change', {
    city: selectedCity.value,
    county: selectedCounty.value,
    town: selectedTown.value,
    village: selectedVillage.value
  })
})

/** 切换指标 */
function selectIndicator(key: SoilIndicator) {
  selectedIndicator.value = key
  showIndicatorDropdown.value = false
  emit('indicator-change', key)
}

/** 点击外部关闭下拉 */
function handleClickOutside() {
  showIndicatorDropdown.value = false
}
</script>

<template>
  <div class="map-filter" @click.stop>
    <!-- 行政区域筛选 -->
    <div class="filter-row">
      <div class="location-icon">📍</div>

      <select v-model="selectedCity" class="filter-select">
        <option value="">市级</option>
        <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
      </select>

      <select v-model="selectedCounty" class="filter-select" :disabled="!selectedCity">
        <option value="">县（区）级</option>
        <option v-for="county in counties" :key="county" :value="county">{{ county }}</option>
      </select>

      <select v-model="selectedTown" class="filter-select" :disabled="!selectedCounty">
        <option value="">镇级</option>
        <option v-for="town in towns" :key="town" :value="town">{{ town }}</option>
      </select>

      <select v-model="selectedVillage" class="filter-select" :disabled="!selectedTown">
        <option value="">村级</option>
        <option v-for="village in villages" :key="village" :value="village">{{ village }}</option>
      </select>

      <!-- 指标选择器 -->
      <div class="indicator-selector">
        <button
          class="indicator-btn"
          @click="showIndicatorDropdown = !showIndicatorDropdown"
        >
          {{ currentIndicatorLabel }}
          <span class="arrow" :class="{ open: showIndicatorDropdown }">▾</span>
        </button>
        <div v-if="showIndicatorDropdown" class="indicator-dropdown">
          <div
            v-for="config in INDICATOR_CONFIGS"
            :key="config.key"
            class="indicator-option"
            :class="{ active: selectedIndicator === config.key }"
            @click="selectIndicator(config.key)"
          >
            {{ config.label }}
          </div>
        </div>
      </div>

      <!-- 土壤类型分布按钮 -->
      <button class="type-btn">土壤类型分布</button>
    </div>
  </div>
  <!-- 遮罩层，点击关闭下拉 -->
  <div v-if="showIndicatorDropdown" class="filter-overlay" @click="handleClickOutside"></div>
</template>

<style scoped>
.map-filter {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  padding: 6px 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.location-icon {
  font-size: 18px;
  margin-right: 4px;
}

.filter-select {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  background: #fff;
  cursor: pointer;
  outline: none;
  min-width: 90px;
  transition: border-color 0.2s;
}

.filter-select:hover {
  border-color: #4A90D9;
}

.filter-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.indicator-selector {
  position: relative;
}

.indicator-btn {
  padding: 6px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
  color: #333;
  background: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: border-color 0.2s;
}

.indicator-btn:hover {
  border-color: #4A90D9;
}

.arrow {
  font-size: 10px;
  transition: transform 0.2s;
}

.arrow.open {
  transform: rotate(180deg);
}

.indicator-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 6px 0;
  min-width: 100px;
  z-index: 30;
}

.indicator-option {
  padding: 8px 16px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: background 0.15s;
}

.indicator-option:hover {
  background: rgba(74, 144, 217, 0.1);
  color: #333;
}

.indicator-option.active {
  color: #4A90D9;
  font-weight: 600;
}

.type-btn {
  padding: 6px 14px;
  border: 1px solid #4A90D9;
  border-radius: 6px;
  font-size: 13px;
  color: #fff;
  background: #4A90D9;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;
}

.type-btn:hover {
  opacity: 0.85;
}

.filter-overlay {
  position: fixed;
  inset: 0;
  z-index: 15;
}
</style>
