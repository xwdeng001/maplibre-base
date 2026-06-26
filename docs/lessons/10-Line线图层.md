# 10 Line 线图层

> 对应页面：`src/views/stage3/Lesson10_Line.vue`

## 学习目标

- 配置线色、线宽、透明度、端点与连接
- 使用 `line-dasharray` 虚线
- 了解 `line-gradient`（需 `lineMetrics: true`）

## 最小配置

```ts
map.addLayer({
  id: 'route',
  type: 'line',
  source: 'geojson-line',
  layout: {
    'line-cap': 'round',   // butt | round | square
    'line-join': 'round'   // bevel | round | miter
  },
  paint: {
    'line-color': '#1890ff',
    'line-width': 4,
    'line-opacity': 1
  }
})
```

## 虚线

```ts
paint: {
  'line-dasharray': [4, 2]   // 实线长、间隔长（单位：线宽倍数）
}
```

设为 `undefined` 或移除即实线。本课用 `dashMap` 映射 solid/dash/dot。

## 线宽与缩放

默认线宽为 **像素**；可用表达式按 zoom 缩放：

```ts
'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 14, 6]
```

## 线渐变（进阶）

Source 需：

```ts
map.addSource('line', {
  type: 'geojson',
  data: lineFeature,
  lineMetrics: true
})
```

Paint：

```ts
'line-gradient': [
  'interpolate', ['linear'], ['line-progress'],
  0, '#1890ff',
  1, '#f5222d'
]
```

适合轨迹「进度」、拥堵分段（需预处理或合适属性）。

## 描边技巧（道路效果）

双层 line：下层宽+浅色，上层窄+深色，模拟描边。

## 常见坑

1. `line-miter-limit` 尖角过尖时须调
2. 与 `fill` 共 source 时 filter 限定 `LineString`
3. 过宽的线在低 zoom 可能遮挡面

## 面试要点

- GeoJSON 线坐标至少 2 点
- **大圆航线** 长距离应插值 densify，否则直线穿球

## 练习

- 切换 `line-cap` 观察端点
- 给长安街加 `line-offset`（平行偏移）