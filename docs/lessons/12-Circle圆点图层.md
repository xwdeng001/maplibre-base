# 12 Circle 圆点图层

> 对应页面：`src/views/stage3/Lesson12_Circle.vue`

## 学习目标

- 用 `circle` 层做点状可视化（散点图）
- 固定样式 vs **数据驱动** 半径、颜色
- 理解 circle 与 symbol 的选型

## 最小配置

```ts
map.addLayer({
  id: 'points-circle',
  type: 'circle',
  source: 'points',
  paint: {
    'circle-radius': 8,
    'circle-color': '#1890ff',
    'circle-opacity': 0.8,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#fff',
    'circle-blur': 0
  }
})
```

## 常用 paint

| 属性 | 说明 |
|------|------|
| `circle-radius` | 半径（像素），可表达式 |
| `circle-color` | 填充色 |
| `circle-stroke-width` / `circle-stroke-color` | 描边 |
| `circle-blur` | 模糊，偏热力感 |
| `circle-opacity` | 透明度 |

## 数据驱动示例（本课）

**按数值改大小：**

```ts
'circle-radius': [
  'interpolate', ['linear'], ['get', 'value'],
  0, 4,
  50, 10,
  100, 20
]
```

**按类型改色（match）：**

```ts
'circle-color': [
  'match', ['get', 'type'],
  '景点', '#1890ff',
  '公园', '#52c41a',
  /* default */ '#999'
]
```

运行时切换模式可用 `setPaintProperty` 整段替换表达式。

## Circle vs Symbol

| | Circle | Symbol |
|--|--------|--------|
| 性能 | 大量点更轻 | 图文、图标更重 |
| 样式 | 圆点+描边 | 字体、sprite、碰撞 |
| 场景 | 散点、简单分类 | 标注、POI 图标 |

上万点可考虑 **heatmap** 或 **cluster**（GeoJSON source）。

## 常见坑

1. 半径过大在低 zoom 互相遮挡 → 用 zoom 插值缩小
2. 只支持 **Point** 几何（MultiPoint 会多点绘制）

## 练习

- 增加 `circle-color` 按 `value` 的 `interpolate`
- 对比 5000 点 circle vs symbol 帧率