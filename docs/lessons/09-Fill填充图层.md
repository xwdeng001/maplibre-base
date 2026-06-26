# 09 Fill 填充图层

> 对应页面：`src/views/stage3/Lesson09_Fill.vue`

## 学习目标

- 使用 `fill` layer 渲染 Polygon / MultiPolygon
- 掌握 `paint` 属性与运行时 `setPaintProperty`
- 实现 **choropleth（分级设色）** 与基础模式切换

## 最小配置

```ts
map.addLayer({
  id: 'districts-fill',
  type: 'fill',
  source: 'my-geojson',
  paint: {
    'fill-color': '#1890ff',
    'fill-opacity': 0.5,
    'fill-outline-color': '#0050b3'  // 简单描边（细）
  }
})
```

复杂描边常用 **额外 `line` layer** 引用同一 source（本仓库第 06 课模式）。

## 常用 paint 属性

| 属性 | 说明 |
|------|------|
| `fill-color` | 填充色，支持表达式 |
| `fill-opacity` | 0~1 |
| `fill-outline-color` | 轮廓色（与 line 层相比较粗有限） |
| `fill-pattern` | 填充图案（sprite 图标名） |
| `fill-antialias` | 抗锯齿 |

## layout

fill 层 layout 较少，可见性：

```ts
map.setLayoutProperty('layer-id', 'visibility', 'none' | 'visible')
```

## 分级设色（数据驱动预告）

```ts
'fill-color': [
  'match',
  ['get', 'level'],
  '高', '#f5222d',
  '中', '#faad14',
  '低', '#52c41a',
  '#ccc'  // default
]
```

或用 `interpolate` 按 `population` 连续渐变（第 20 课）。

## 运行时修改（本课 watch）

```ts
map.setPaintProperty('districts-fill', 'fill-opacity', val)
```

适合 UI 滑块联动，无需重建 layer。

## 与 filter 结合

只画面要素：

```ts
filter: ['==', ['geometry-type'], 'Polygon']
```

## 常见坑

1. 数据非闭合环 → 不渲染或异常
2. **fill + line** 描边时，线宽用 `line-width` 更可控
3. 透明度过低在浅色底图上对比不足

## 面试要点

- fill 不能画 Point/Line，几何不对会静默失败
- 3D 挤出用 `fill-extrusion`（第 14 课），不是 fill

## 练习

- 用 `interpolate` 按 `population` 做连续色带
- hover 高亮：`feature-state` + `setFeatureState`