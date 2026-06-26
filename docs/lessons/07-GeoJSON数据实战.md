# 07 GeoJSON 数据实战

> 对应页面：`src/views/stage2/Lesson07_GeoJSON.vue`

## 学习目标

- 熟悉 GeoJSON 几何类型与坐标结构
- 同一 `FeatureCollection` 用 **filter + 多 layer** 画混合几何
- 掌握 `GeoJSONSource.setData` 动态更新

## GeoJSON 结构速查

```ts
// FeatureCollection（最常用）
{ type: 'FeatureCollection', features: [ Feature, ... ] }

// Feature
{
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [lng, lat] },
  properties: { name: '天安门' }
}
```

## 几何类型

| type | coordinates 形状 |
|------|------------------|
| Point | `[lng, lat]` |
| MultiPoint | `[[lng,lat], ...]` |
| LineString | `[[lng,lat], ...]` 至少 2 点 |
| MultiLineString | 多条线 |
| Polygon | `[ 外环, 洞1, 洞2... ]`，外环**首尾闭合** |
| MultiPolygon | 多个 Polygon |

**注意：** 永远是 **经度在前、纬度在后**（WGS84）。

## 图层与几何匹配

| 几何 | layer type |
|------|------------|
| Point / MultiPoint | `circle` 或 `symbol` |
| LineString | `line` |
| Polygon | `fill` + `line` 描边 |

MultiPoint 在 MapLibre 中常按 **Point** 处理渲染。

## 混合几何：filter 按类型分流

```ts
filter: ['==', ['geometry-type'], 'Polygon']
filter: ['==', ['geometry-type'], 'LineString']
filter: ['==', ['geometry-type'], 'Point']
```

也可用 `['in', ['geometry-type'], ['literal', ['Point', 'MultiPoint']]]`。

## 动态更新数据

```ts
const source = map.getSource('demo-source') as maplibregl.GeoJSONSource
source.setData(updatedFeatureCollection)
```

无需重新 `addSource`；已有关联 layer 会自动重绘。

适合：实时轨迹、编辑结果回写、轮询刷新点位。

## 标注 properties

```ts
layout: {
  'text-field': ['get', 'name'],
  'text-size': 12,
  'text-anchor': 'top',
  'text-offset': [0, 1.5]
}
```

## 常见坑

1. Polygon 环方向：外环逆时针（右手规则）在部分工具链有要求，异常镂空时检查
2. 直接 **mutate** `features.push` 后 `setData` 同一对象引用有时不触发更新，可 **浅拷贝** 新对象
3. 超大 GeoJSON 放主线程会卡，应 **分片加载或转 vector tiles**

## 面试要点

- GeoJSON 是 **WGS84**，与地图 CRS 不同但 MapLibre 会自动投影
- `properties` 可驱动表达式（第 19–20 课）

## 练习

- 增加 `MultiPolygon` 示例
- 点击要素用 `queryRenderedFeatures` 显示 properties（预告第 17 课）