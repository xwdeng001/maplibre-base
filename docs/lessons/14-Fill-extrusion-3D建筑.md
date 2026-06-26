# 14 Fill-extrusion 3D 建筑

> 对应页面：`src/views/stage3/Lesson14_FillExtrusion.vue`

## 学习目标

- 用 `fill-extrusion` 将 Polygon 拉伸为柱体
- 掌握 `fill-extrusion-height`、`fill-extrusion-base`
- 配合 **pitch** 实现城市 3D 视图

## 最小配置

```ts
map.addLayer({
  id: 'buildings-3d',
  type: 'fill-extrusion',
  source: 'buildings',
  paint: {
    'fill-extrusion-color': '#5dade2',
    'fill-extrusion-height': ['get', 'height'],  // 米
    'fill-extrusion-base': 0,
    'fill-extrusion-opacity': 0.85,
    'fill-extrusion-vertical-gradient': true
  }
})
```

## 常用 paint

| 属性 | 说明 |
|------|------|
| `fill-extrusion-height` | 顶部高度（米），可用表达式 |
| `fill-extrusion-base` | 底部高度，架空/分层 |
| `fill-extrusion-color` | 侧面与顶面着色 |
| `fill-extrusion-opacity` | 透明度 |
| `fill-extrusion-vertical-gradient` | 底部略暗，增强立体感 |

## 相机

```ts
map.easeTo({ pitch: 60, bearing: -20, zoom: 15 })
```

无 pitch 时 extrusion 看起来像色块边线。

## 数据来源

- GeoJSON 建筑轮廓 + `height` / `min_height` 属性
- 矢量瓦片建筑层（OSM `building`）+ `source-layer`

真实项目常用 **Mapbox Vector Tiles** 或自建 MVT。

## 与 Terrain 关系

- `fill-extrusion` 是 **直立柱体** 在平面地图上
- `raster-dem` + `terrain` 是地表起伏，可叠加但不自动「贴地」建筑

## 常见坑

1. 高度单位是 **米**，属性是字符串要 `to-number`
2. 建筑 polygon 重叠会 z-fighting，需数据清洗
3. 低性能设备大量 extrusion 掉帧 → 按 zoom 显示、简化几何

## 面试要点

- 3D 建筑 ≠ Cesium 模型，是 2.5D 挤出
- 颜色可按高度 `interpolate` 做天际线层次

## 练习

- `colorMode: height` 用 interpolate 上色
- 对比 `vertical-gradient` 开关