# 06 数据源（Sources）

> 对应页面：`src/views/stage2/Lesson06_Sources.vue`

## 学习目标

- 掌握 MapLibre 六种 source 类型及适用场景
- 熟练 `addSource` / `removeSource` 与图层的依赖顺序
- 用 GeoJSON 做点、线、面组合展示

## Source 与 Layer 关系

```
Source（原材料）  →  Layer（画法，可多个 layer 共用同一 source）
```

规则：

1. **先 `addSource`，再 `addLayer`**
2. **删除时先 `removeLayer`，再 `removeSource`**
3. 同一 `source` 可被多个 layer 引用（如 fill + outline + label）

## 六种 Source 类型

| type | 说明 |
|------|------|
| `vector` | 矢量瓦片（MVT/PBF），需 `url` 或 `tiles` + `source-layer` |
| `raster` | 栅格瓦片 PNG/JPEG/WebP |
| `raster-dem` | 地形高程，用于 `terrain` |
| `geojson` | 内存或 URL 的 GeoJSON，最灵活 |
| `image` | 四角坐标贴一张图 |
| `video` | 四角坐标贴视频 |

## GeoJSON Source

```ts
map.addSource('geojson-points', {
  type: 'geojson',
  data: featureCollection   // 对象或 URL
})
```

动态更新（第 07 课详述）：

```ts
;(map.getSource('id') as maplibregl.GeoJSONSource).setData(newData)
```

可选：`cluster: true`、`clusterRadius` 做点聚合。

## 瓦片 URL 模板

```
https://example.com/{z}/{x}/{y}.png
```

| 占位符 | 含义 |
|--------|------|
| `{z}` | zoom level |
| `{x}` | 列 |
| `{y}` | 行 |

天地图 WMTS 用 `TILEMATRIX={z}&TILECOL={x}&TILEROW={y}` 形式，本质相同。

**`tiles` 可为字符串数组**，MapLibre 轮询以负载均衡（本项目 `t0~t7`）。

## 本课图层组合模式

| 几何 | 常用 layer |
|------|------------|
| Point | `circle` 或 `symbol` |
| LineString | `line` |
| Polygon | `fill` + `line`（描边） |
| 标注 | `symbol` + `text-field` |

## 面试要点

- **vector tile** 要在 layer 上指定 `source-layer` 名称
- GeoJSON 大数据量时考虑 **简化几何、服务端矢量瓦片、或 Supercluster**
- `promoteId` 可把属性提升为 feature id，便于 `feature-state`

## 练习

- 给 polygon 增加 `fill-outline-color`（部分版本用 line 层更可控）
- 尝试 `map.getSource()` 判断存在再添加，避免重复 add 报错