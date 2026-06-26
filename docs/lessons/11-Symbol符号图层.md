# 11 Symbol 符号图层

> 对应页面：`src/views/stage3/Lesson11_Symbol.vue`

## 学习目标

- 用 `symbol` 同时展示 **文字** 与 **图标**
- 理解 `glyphs`、`text-field` 表达式
- 掌握碰撞检测 `text-allow-overlap` / `icon-allow-overlap`
- 注册自定义图片 `map.addImage`

## Symbol 两大能力

| 能力 | 典型 layout 属性 |
|------|------------------|
| 文字 | `text-field`, `text-size`, `text-font`, `text-anchor`, `text-offset` |
| 图标 | `icon-image`, `icon-size`, `icon-anchor`, `icon-offset` |

可只文字、只图标、或图文并列。

## 文字标注

```ts
layout: {
  'text-field': ['get', 'name'],
  'text-size': 14,
  'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
  'text-anchor': 'top',
  'text-offset': [0, 1.2]
},
paint: {
  'text-color': '#333',
  'text-halo-color': '#fff',
  'text-halo-width': 1.5
}
```

**`text-field`** 可为字符串或表达式，如 `['concat', '人口:', ['get', 'pop']]`。

Style 必须配置 **`glyphs`** URL，否则无字体。

## 碰撞与避让

默认符号会 **相互避让** 防止重叠：

```ts
'text-allow-overlap': false,
'icon-allow-overlap': false,
'text-ignore-placement': false
```

设为 `true` 强制全部显示（密集区会乱）。

## 自定义图标

```ts
const { width, height, data } = createImageDataFromCanvas()
if (!map.hasImage('my-pin')) {
  map.addImage('my-pin', { width, height, data })
}
layout: { 'icon-image': 'my-pin', 'icon-size': 1 }
```

也可用 `map.loadImage(url, callback)` 加载 PNG/SVG（视支持情况）。

雪碧图：style 的 `sprite` 提供 `@2x` 等，layer 里 `icon-image` 写图标名。

## 按属性选图标

```ts
'icon-image': ['match', ['get', 'rank'], 1, 'star', 'dot']
```

## 常见坑

1. 字体 stack 与 glyphs 服务字体名不一致 → 不显示
2. 中文需 **含 CJK 的 glyph 服务**（非所有 demo 样式支持中文）
3. `addImage` 要在 `load` 后、`addLayer` 前或 layer 创建前完成

## 面试要点

- Symbol 性能：大量标注考虑 **聚合** 或 **按 zoom 显示**
- `symbol-sort-key` 控制绘制优先级

## 练习

- 打开 `allowOverlap` 对比城市注记密度
- 用 `text-variable-anchor` 自动选锚点