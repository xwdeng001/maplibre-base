import type { FeatureCollection, Feature, Polygon } from 'geojson'

/** pH值等级定义 */
export interface PhLevel {
  label: string
  range: string
  color: string
  min: number
  max: number
}

/** 土壤检测指标类型 */
export type SoilIndicator = 'pH' | 'organicMatter' | 'availableN' | 'availableP' | 'availableK'

/** 指标配置 */
export interface IndicatorConfig {
  key: SoilIndicator
  label: string
  unit: string
  levels: PhLevel[]
}

/** 地块属性 */
export interface PlotProperties {
  id: string
  name: string
  /** 检测日期 */
  testDate: string
  /** 面积（亩） */
  area: number
  /** pH值 */
  pH: number
  /** 有机质含量 g/kg */
  organicMatter: number
  /** 速效氮 mg/kg */
  availableN: number
  /** 速效磷 mg/kg */
  availableP: number
  /** 速效钾 mg/kg */
  availableK: number
  /** 所属市 */
  city: string
  /** 所属县/区 */
  county: string
  /** 所属镇 */
  town: string
  /** 所属村 */
  village: string
}

/** pH 等级配色 */
export const PH_LEVELS: PhLevel[] = [
  { label: '强碱性', range: '>8.5', color: '#4A90D9', min: 8.5, max: 14 },
  { label: '弱碱性', range: '7.5-8.5', color: '#89CFF0', min: 7.5, max: 8.5 },
  { label: '中性', range: '6.5-7.5', color: '#B8E986', min: 6.5, max: 7.5 },
  { label: '弱酸性', range: '4.5-6.5', color: '#F5A623', min: 4.5, max: 6.5 },
  { label: '强酸性', range: '<4.5', color: '#D0021B', min: 0, max: 4.5 }
]

/** 有机质等级 */
export const ORGANIC_MATTER_LEVELS: PhLevel[] = [
  { label: '极高', range: '>40', color: '#1a5276', min: 40, max: 999 },
  { label: '高', range: '30-40', color: '#2980b9', min: 30, max: 40 },
  { label: '中', range: '20-30', color: '#82e0aa', min: 20, max: 30 },
  { label: '低', range: '10-20', color: '#f39c12', min: 10, max: 20 },
  { label: '极低', range: '<10', color: '#e74c3c', min: 0, max: 10 }
]

/** 速效氮等级 */
export const AVAILABLE_N_LEVELS: PhLevel[] = [
  { label: '极高', range: '>150', color: '#1a5276', min: 150, max: 999 },
  { label: '高', range: '120-150', color: '#2980b9', min: 120, max: 150 },
  { label: '中', range: '90-120', color: '#82e0aa', min: 90, max: 120 },
  { label: '低', range: '60-90', color: '#f39c12', min: 60, max: 90 },
  { label: '极低', range: '<60', color: '#e74c3c', min: 0, max: 60 }
]

/** 速效磷等级 */
export const AVAILABLE_P_LEVELS: PhLevel[] = [
  { label: '极高', range: '>40', color: '#1a5276', min: 40, max: 999 },
  { label: '高', range: '20-40', color: '#2980b9', min: 20, max: 40 },
  { label: '中', range: '10-20', color: '#82e0aa', min: 10, max: 20 },
  { label: '低', range: '5-10', color: '#f39c12', min: 5, max: 10 },
  { label: '极低', range: '<5', color: '#e74c3c', min: 0, max: 5 }
]

/** 速效钾等级 */
export const AVAILABLE_K_LEVELS: PhLevel[] = [
  { label: '极高', range: '>200', color: '#1a5276', min: 200, max: 999 },
  { label: '高', range: '150-200', color: '#2980b9', min: 150, max: 200 },
  { label: '中', range: '100-150', color: '#82e0aa', min: 100, max: 150 },
  { label: '低', range: '50-100', color: '#f39c12', min: 50, max: 100 },
  { label: '极低', range: '<50', color: '#e74c3c', min: 0, max: 50 }
]

/** 所有指标配置 */
export const INDICATOR_CONFIGS: IndicatorConfig[] = [
  { key: 'pH', label: 'pH', unit: '', levels: PH_LEVELS },
  { key: 'organicMatter', label: '有机质', unit: 'g/kg', levels: ORGANIC_MATTER_LEVELS },
  { key: 'availableN', label: '速效氮', unit: 'mg/kg', levels: AVAILABLE_N_LEVELS },
  { key: 'availableP', label: '速效磷', unit: 'mg/kg', levels: AVAILABLE_P_LEVELS },
  { key: 'availableK', label: '速效钾', unit: 'mg/kg', levels: AVAILABLE_K_LEVELS }
]

/** 行政区域数据 */
export const REGIONS = {
  cities: ['昆明市'],
  counties: { '昆明市': ['宜良县'] },
  towns: { '宜良县': ['北古城镇', '南羊镇'] },
  villages: {
    '北古城镇': ['大薛营村', '河东村', '马街村'],
    '南羊镇': ['小渡口村', '清水沟村']
  }
} as const

/** 根据指标值获取对应颜色 */
export function getColorByValue(value: number, levels: PhLevel[]): string {
  for (const level of levels) {
    if (value >= level.min && value < level.max) {
      return level.color
    }
  }
  return levels[levels.length - 1].color
}

/** 根据指标值获取等级标签 */
export function getLevelLabel(value: number, levels: PhLevel[]): string {
  for (const level of levels) {
    if (value >= level.min && value < level.max) {
      return level.label
    }
  }
  return levels[levels.length - 1].label
}

/**
 * 生成模拟的地块多边形数据
 * 以昆明市宜良县附近为中心点
 */
export function generateMockSoilData(): FeatureCollection<Polygon, PlotProperties> {
  /** 基础中心点 - 宜良县附近 */
  const baseLng = 103.15
  const baseLat = 24.92

  /** 模拟地块数据 */
  const plots: Feature<Polygon, PlotProperties>[] = [
    {
      type: 'Feature',
      properties: {
        id: 'plot-001',
        name: '大薛营东区',
        testDate: '2025.4.2',
        area: 126.5,
        pH: 8.7,
        organicMatter: 35.2,
        availableN: 132,
        availableP: 28.5,
        availableK: 165,
        city: '昆明市',
        county: '宜良县',
        town: '北古城镇',
        village: '大薛营村'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [baseLng - 0.025, baseLat + 0.018],
          [baseLng - 0.018, baseLat + 0.025],
          [baseLng - 0.008, baseLat + 0.023],
          [baseLng - 0.005, baseLat + 0.016],
          [baseLng - 0.012, baseLat + 0.012],
          [baseLng - 0.022, baseLat + 0.013],
          [baseLng - 0.025, baseLat + 0.018]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'plot-002',
        name: '河东区主地块',
        testDate: '2025.4.2',
        area: 238.3,
        pH: 3.8,
        organicMatter: 18.6,
        availableN: 78,
        availableP: 12.3,
        availableK: 95,
        city: '昆明市',
        county: '宜良县',
        town: '北古城镇',
        village: '河东村'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [baseLng - 0.005, baseLat + 0.012],
          [baseLng + 0.002, baseLat + 0.020],
          [baseLng + 0.015, baseLat + 0.018],
          [baseLng + 0.018, baseLat + 0.010],
          [baseLng + 0.012, baseLat + 0.003],
          [baseLng + 0.002, baseLat + 0.002],
          [baseLng - 0.004, baseLat + 0.006],
          [baseLng - 0.005, baseLat + 0.012]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'plot-003',
        name: '马街村北地块',
        testDate: '2025.4.2',
        area: 95.7,
        pH: 7.0,
        organicMatter: 25.3,
        availableN: 105,
        availableP: 18.9,
        availableK: 138,
        city: '昆明市',
        county: '宜良县',
        town: '北古城镇',
        village: '马街村'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [baseLng + 0.003, baseLat - 0.005],
          [baseLng + 0.010, baseLat - 0.002],
          [baseLng + 0.018, baseLat - 0.004],
          [baseLng + 0.016, baseLat - 0.012],
          [baseLng + 0.008, baseLat - 0.014],
          [baseLng + 0.003, baseLat - 0.010],
          [baseLng + 0.003, baseLat - 0.005]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'plot-004',
        name: '小渡口村地块',
        testDate: '2025.4.5',
        area: 67.2,
        pH: 5.8,
        organicMatter: 12.4,
        availableN: 65,
        availableP: 7.8,
        availableK: 72,
        city: '昆明市',
        county: '宜良县',
        town: '南羊镇',
        village: '小渡口村'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [baseLng - 0.022, baseLat - 0.003],
          [baseLng - 0.016, baseLat + 0.002],
          [baseLng - 0.010, baseLat + 0.001],
          [baseLng - 0.011, baseLat - 0.006],
          [baseLng - 0.017, baseLat - 0.008],
          [baseLng - 0.022, baseLat - 0.003]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'plot-005',
        name: '清水沟村地块',
        testDate: '2025.4.2',
        area: 152.8,
        pH: 7.8,
        organicMatter: 42.1,
        availableN: 155,
        availableP: 35.6,
        availableK: 188,
        city: '昆明市',
        county: '宜良县',
        town: '南羊镇',
        village: '清水沟村'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [baseLng - 0.008, baseLat - 0.008],
          [baseLng + 0.000, baseLat - 0.004],
          [baseLng + 0.006, baseLat - 0.007],
          [baseLng + 0.005, baseLat - 0.015],
          [baseLng - 0.002, baseLat - 0.018],
          [baseLng - 0.007, baseLat - 0.014],
          [baseLng - 0.008, baseLat - 0.008]
        ]]
      }
    }
  ]

  return {
    type: 'FeatureCollection',
    features: plots
  }
}
