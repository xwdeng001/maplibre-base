# 15 Marker 标记点

> 对应页面：`src/views/stage4/Lesson15_Marker.vue`

## 学习目标

- 使用 `maplibregl.Marker` 在地图上钉 DOM 元素
- 区分 **默认 Marker**、**自定义 element**、**可拖拽**
- 与 `Popup` 联动

## 基本用法

```ts
const marker = new maplibregl.Marker({ color: '#f5222d' })
  .setLngLat([116.39, 39.91])
  .addTo(map)

marker.remove()  // 销毁
```

## 自定义 DOM

```ts
const el = document.createElement('div')
el.innerHTML = '��️'
el.style.fontSize = '28px'

new maplibregl.Marker({ element: el, anchor: 'bottom' })
  .setLngLat([lng, lat])
  .addTo(map)
```

`anchor` 决定经纬度对齐到元素的哪一点（`center`、`bottom` 等）。

## 拖拽

```ts
new maplibregl.Marker({ draggable: true })
  .setLngLat([lng, lat])
  .addTo(map)
  .on('dragend', () => {
    const pos = marker.getLngLat()
  })
```

## 绑定 Popup

```ts
const popup = new maplibregl.Popup({ offset: 25 })
  .setHTML('<b>标题</b>')

marker.setPopup(popup)  // 点击 marker 打开
// 或 popup.addTo(map) 独立显示
```

## Marker vs Circle/Symbol Layer

| | Marker | Layer |
|--|--------|-------|
| 实现 | HTML DOM | WebGL |
| 数量 | 几十~上百尚可 | 上万更优 |
| 样式 | 任意 HTML/CSS | Style Spec |
| 随地图旋转倾斜 | 仅位置跟随，DOM 不贴地 | 与地图一体 |

大量 POI 优先 **symbol/circle**；需要复杂组件 UI 用 **Marker + Vue 组件挂载**。

## Vue 注意点

- 路由离开须 `marker.remove()`，本课用数组统一清理
- 自定义 DOM 事件与地图 `dragPan` 可能冲突，可 `dragstart` 时 `map.dragPan.disable()`

## 练习

- 拖拽结束后把坐标写回表单
- 用 Vue `createApp` 挂载小组件到 Marker 元素