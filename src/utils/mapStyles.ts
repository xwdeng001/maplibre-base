/**
 * 天地图底图样式配置
 * 统一管理所有地图页面的底图样式，避免重复代码
 */
import type { StyleSpecification } from 'maplibre-gl'

/** 天地图 API Key */
const TDT_KEY = import.meta.env.VITE_TIANDITU_KEY as string

/** 天地图子域名列表（t0~t7 负载均衡） */
const TDT_SUBDOMAINS = ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']

/** 生成天地图瓦片 URL 数组（利用多子域名并行加载） */
function tdtTiles(layer: string, tilematrixset: string = 'w'): string[] {
  return TDT_SUBDOMAINS.map(
    sub => `https://${sub}.tianditu.gov.cn/${layer}_${tilematrixset}/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${layer}&STYLE=default&TILEMATRIXSET=${tilematrixset}&FORMAT=tiles&TILECOL={x}&TILEROW={y}&TILEMATRIX={z}&tk=${TDT_KEY}`
  )
}

/**
 * 天地图矢量底图（含注记）
 * vec_w: 矢量底图  cva_w: 矢量注记
 */
export const tiandituVecStyle: StyleSpecification = {
  version: 8,
  sources: {
    'tdt-vec': {
      type: 'raster',
      tiles: tdtTiles('vec'),
      tileSize: 256,
      attribution: '&copy; <a href="https://www.tianditu.gov.cn/" target="_blank">天地图</a>'
    },
    'tdt-cva': {
      type: 'raster',
      tiles: tdtTiles('cva'),
      tileSize: 256
    }
  },
  layers: [
    { id: 'tdt-vec-layer', type: 'raster', source: 'tdt-vec' },
    { id: 'tdt-cva-layer', type: 'raster', source: 'tdt-cva' }
  ]
}

/**
 * 天地图卫星影像（含注记）
 * img_w: 卫星影像  cia_w: 影像注记
 */
export const tiandituImgStyle: StyleSpecification = {
  version: 8,
  sources: {
    'tdt-img': {
      type: 'raster',
      tiles: tdtTiles('img'),
      tileSize: 256,
      attribution: '&copy; <a href="https://www.tianditu.gov.cn/" target="_blank">天地图</a>'
    },
    'tdt-cia': {
      type: 'raster',
      tiles: tdtTiles('cia'),
      tileSize: 256
    }
  },
  layers: [
    { id: 'tdt-img-layer', type: 'raster', source: 'tdt-img' },
    { id: 'tdt-cia-layer', type: 'raster', source: 'tdt-cia' }
  ]
}

/**
 * 天地图地形晕渲（含注记）
 * ter_w: 地形晕渲  cta_w: 地形注记
 */
export const tiandituTerStyle: StyleSpecification = {
  version: 8,
  sources: {
    'tdt-ter': {
      type: 'raster',
      tiles: tdtTiles('ter'),
      tileSize: 256,
      attribution: '&copy; <a href="https://www.tianditu.gov.cn/" target="_blank">天地图</a>'
    },
    'tdt-cta': {
      type: 'raster',
      tiles: tdtTiles('cta'),
      tileSize: 256
    }
  },
  layers: [
    { id: 'tdt-ter-layer', type: 'raster', source: 'tdt-ter' },
    { id: 'tdt-cta-layer', type: 'raster', source: 'tdt-cta' }
  ]
}

/** 底图样式映射表 */
export const MAP_STYLES = {
  /** 天地图矢量 */
  vec: tiandituVecStyle,
  /** 天地图影像 */
  img: tiandituImgStyle,
  /** 天地图地形 */
  ter: tiandituTerStyle
} as const

/** 底图样式类型 */
export type MapStyleKey = keyof typeof MAP_STYLES

/** 底图选项列表（供 UI 下拉/单选使用） */
export const MAP_STYLE_OPTIONS = [
  { label: '天地图矢量', value: 'vec' as MapStyleKey },
  { label: '天地图影像', value: 'img' as MapStyleKey },
  { label: '天地图地形', value: 'ter' as MapStyleKey }
]

/** 根据 key 获取地图样式 */
export function getMapStyleByKey(key: MapStyleKey): StyleSpecification {
  return MAP_STYLES[key]
}
