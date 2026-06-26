# 13 Heatmap 热力图层

> 对应页面：`src/views/stage3/Lesson13_Heatmap.vue`

## 学习目标

- 使用 `heatmap` layer 做点密度可视化
- 调节 `heatmap-radius`、`heatmap-intensity`、`heatmap-weight`
- 理解 `heatmap-color` 渐变色带与 `maxzoom` 切换

## 数据源要求

- Source 为 **GeoJSON 点**（或 vector 点层）
- 每个点可有 `weight` 属性表示权重

```ts
properties: { weight: 0.8 }
```

## 最小配置

```ts
map.addLayer({
  id: 'heat-layer',
  type: 'heatmap',
  source: 'heat-points',
  maxzoom: 15,
  paint: {
    'heatmap-weight': ['get', 'weight'],
    'heatmap-intensity': 1,
    'heatmap-radius': 25,
    'heatmap-opacity': 0.8,
    'heatmap-color': [
      'interpolate', ['linear'], ['heatmap-density'],
      0, 'rgba(0,0,255,0)',
      0.2, 'rgb(0,0,255)',
      0.6, 'rgb(255,255,0)',
      1, 'rgb(255,0,0)'
    ]
  }
})
```

## 核心属性

| 属性 | 说明 |
|------|------|
| `heatmap-radius` | 像素半径，越大越「糊」 |
| `heatmap-intensity` | 全局强度倍增 |
| `heatmap-weight` | 单点权重（表达式） |
| `heatmap-color` | 按 **heatmap-density** 0~1 插值颜色 |
| `heatmap-opacity` | 图层透明度 |

`heatmap-density` 是渲染时计算的密度，不是业务字段。

## 与 Circle 对比

| | Heatmap | Circle 散点 |
|--|---------|-------------|
| 效果 | 密度融合 | 离散点 |
| 交互 | 难精确点到点 | 可 query 单点 |
| 数据量 | 适合大量点 | 中等 |

高 zoom 常 **fade 到 circle**（两套 layer + zoom 表达式控制 opacity）。

## 常见坑

1. 点太少看不出效果 → 增 `intensity` / 减 `radius` / 增样本
2. `maxzoom` 后热力消失是预期，需备用图层
3. 权重全 0 则无色

## 面试要点

- 热力在 GPU 上基于核密度估计，非服务端预渲染
- 隐私场景注意聚合后是否泄露精确位置

## 练习

- 改色带为蓝→透明→红单色系
- zoom>14 显示原始 circle 点