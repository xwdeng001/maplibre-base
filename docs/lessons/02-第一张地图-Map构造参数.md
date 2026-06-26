# 02 第一张地图 — Map 构造参数

> 对应页面：`src/views/stage1/Lesson02_FirstMap.vue`  
> 相关配置：`src/utils/mapStyles.ts`

## 学习目标

- 在 Vue 3 中正确初始化、销毁 MapLibre 实例
- 掌握 `Map` 构造函数常用参数与相机（camera）概念
- 用事件把地图状态同步到 UI
- 理解 `setStyle` / `flyTo` 与底图切换

## 最小示例

```ts
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const map = new maplibregl.Map({
  container: domElement,           // 必填：HTMLElement
  style: styleSpecOrUrl,         // 必填：Style JSON 或 URL
  center: [116.39, 39.91],       // [经度, 纬度] — 注意顺序是 lng, lat
  zoom: 10,
  bearing: 0,                      // 旋转角（度），北为上为 0
  pitch: 0,                        // 倾斜角（度），0 为俯视
  maxZoom: 18,
  minZoom: 2
})
```

## 核心参数说明

| 参数 | 类型 | 说明 |
|------|------|------|
| `container` | `HTMLElement` | 地图挂载节点，需有宽高 |
| `style` | `StyleSpecification \| string` | 本地对象或 `style.json` URL |
| `center` | `[number, number]` | **WGS84**，`[lng, lat]`，不是 lat/lng |
| `zoom` | `number` | 0~22 常见；越大越近 |
| `bearing` | `number` | 地图绕垂直轴旋转 |
| `pitch` | `number` | 0~85 左右，3D 视角 |
| `maxZoom` / `minZoom` | `number` | 限制用户缩放范围 |
| `hash` | `boolean` | 为 true 时 URL hash 同步视角 |
| `attributionControl` | `boolean` | 是否显示版权控件 |

## Vue 3 集成模式（本课采用）

1. **`ref` 绑定容器**：`<div ref="mapContainer" />`
2. **`onMounted` 里 `initMap`**：确保 DOM 已存在
3. **地图实例用模块级 `let map`**：不必放进 `ref`（避免响应式包装）
4. **`onBeforeUnmount` 里 `map.remove()`**：释放 WebGL、事件、瓦片请求

```ts
let map: maplibregl.Map | null = null

onBeforeUnmount(() => {
  map?.remove()
  map = null
})
```

## 相机状态读取

| API | 含义 |
|-----|------|
| `map.getCenter()` | `{ lng, lat }` |
| `map.getZoom()` | 当前 zoom |
| `map.getBearing()` | 旋转 |
| `map.getPitch()` | 倾斜 |

## 事件：`move` vs `moveend`

- **`move`**：拖动/缩放/旋转过程中**连续触发**，适合实时刷新面板
- **`moveend`**：动画或交互**结束后**触发一次，适合埋点、请求新数据

本课在 `move` 里更新 `center` / `zoom` / `bearing` / `pitch`。

### 数值格式化：`+` 与 `+=`（易混点）

`toFixed(n)` 返回的是 **字符串**。面板需要数字时，常见两种写法：

```ts
// 写法 A：一元 + 转成 number（本课使用）
center.value.lng = +c.lng.toFixed(4)

// 写法 B：Number() 或 parseFloat
center.value.lng = Number(c.lng.toFixed(4))
```

**`+=` 是「加等于」**，例如 `zoom.value += 1` 表示在原有 zoom 上加 1，**不能**用来把字符串转成数字。

若写成 `center.value.lng += c.lng.toFixed(4)` 会先隐式转 number 再相加，**坐标会错乱**，这是 bug。

## 底图切换

```ts
watch(currentStyle, (val) => {
  map?.setStyle(getMapStyleByKey(val))
})
```

注意：

- **`setStyle` 会替换整个样式**，运行时 `addLayer` / `addSource` 的内容会丢失（除非在 `style.load` 后重新加）
- 切换后需重新监听 `style.load` 若你有自定义图层

项目里天地图样式见 `mapStyles.ts`：`raster` source + 双图层（底图 + 注记）。

## `flyTo` 重置视角

```ts
map.flyTo({
  center: [116.39, 39.91],
  zoom: 10,
  bearing: 0,
  pitch: 0,
  duration: 1500   // 毫秒
})
```

与 `easeTo`（匀速插值）、`jumpTo`（无动画）对比见第 03 课。

## 常见坑

1. **容器高度为 0**：父级未设 `height: 100%` 时地图空白
2. **忘记引入 CSS**：控件/画布样式异常
3. **坐标顺序反了**：写成 `[lat, lng]` 会飞到错误位置
4. **重复 `new Map` 不 `remove`**：路由切换泄漏 WebGL 上下文
5. **天地图 Key**：`.env` 中 `VITE_TIANDITU_KEY`，瓦片 URL 需 `tk=` 参数

## 面试要点

- MapLibre 使用 **Web Mercator（EPSG:3857）** 显示，GeoJSON 输入一般为 WGS84
- **Style 是地图的「配置中心」**，不是只有底图 PNG
- 生产环境要考虑 **token 放环境变量**、**瓦片子域名并行**（本仓库 `t0~t7`）

## 练习建议

- 打开面板控件，改为双向：slider 改 zoom 时 `map.setZoom`
- 增加 `map.on('load')` 打 log，理解首屏瓦片加载时机
- 试 `hash: true` 看 URL 变化