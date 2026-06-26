# 16 Popup 弹窗

> 对应页面：`src/views/stage4/Lesson16_Popup.vue`

## 学习目标

- 创建、定位、关闭 `maplibregl.Popup`
- 使用 `setHTML` / `setDOMContent` / `setText`
- 配置 `offset`、`anchor`、`closeOnClick`

## 基本用法

```ts
new maplibregl.Popup({ offset: 15, closeButton: true })
  .setLngLat([lng, lat])
  .setHTML('<h3>标题</h3><p>内容</p>')
  .addTo(map)
```

单例管理：打开新弹窗前 `activePopup?.remove()`，避免多个 Popup 堆叠。

## 常用选项

| 选项 | 说明 |
|------|------|
| `offset` | 与锚点的像素偏移，可为数字或对象 |
| `closeButton` | 显示关闭钮 |
| `closeOnClick` | 点地图是否关闭 |
| `maxWidth` | 如 `'240px'` |
| `anchor` | `bottom`、`top`、`left` 等，自动避让 |

## 内容方式

```ts
popup.setHTML(string)           // 简单富文本，注意 XSS 需消毒
popup.setDOMContent(HTMLElement) // Vue 渲染的节点可挂这里
popup.setText('纯文本')
```

## 事件

```ts
popup.on('open', () => {})
popup.on('close', () => {})
```

与 Marker：`marker.setPopup(popup)` 后点击 marker 切换显示。

## 点击地图弹出（常见模式）

```ts
map.on('click', 'layer-id', (e) => {
  const props = e.features?.[0]?.properties
  new maplibregl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(JSON.stringify(props))
    .addTo(map)
})
```

需在 layer 上开启交互或 `queryRenderedFeatures`。

## 常见坑

1. HTML 字符串拼接用户数据 → **XSS**，用 DOMPurify 或纯 DOM
2. Popup 在 `map.remove()` 时应一并 remove
3. `setDOMContent` 的节点被移除后勿再复用

## 练习

- 从 `queryRenderedFeatures` 填 Popup
- 试 `trackPointer`（若版本支持）跟随鼠标