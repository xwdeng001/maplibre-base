# base预览地址：https://env-00jy66xyyn4y-static.normal.cloudstatic.cn/maplibre-base/index.html
# pro预览地址：https://env-00jy66xyyn4y-static.normal.cloudstatic.cn/maplibre-pro/index.html

## 技术栈

- **地图引擎**: MapLibre GL JS v5
- **前端框架**: Vue 3 (Composition API + `<script setup>`)
- **UI 组件库**: Ant Design Vue 4
- **语言**: TypeScript
- **构建工具**: Vite 8
- **路由**: Vue Router 5

---

## MapLibre 从入门到精通学习指南

> 📂 每节课文档存放在 `src/docs/` 目录下，格式：`01.课程名称.md`

### 第一阶段：入门基础（第1-4节）

| 节次 | 标题 | 核心内容 | 文档路径 |
|------|------|---------|---------|
| 01 | 认识 MapLibre GL JS | MapLibre 简介与生态、与 Mapbox 的关系、开源许可、应用场景、与其他地图库（Leaflet/OpenLayers/Cesium）对比 | `src/docs/01.认识MapLibre.md` |
| 02 | 环境搭建与第一张地图 | Vue3+Vite 项目创建、安装 MapLibre GL JS、创建第一张地图（Map 构造函数参数详解）、地图容器与响应式尺寸 | `src/docs/02.环境搭建与第一张地图.md` |
| 03 | 地图基础操作 | 缩放/平移/旋转/倾斜、flyTo/easeTo/jumpTo 动画方法、fitBounds 自适应范围、地图事件监听（click/move/zoom/load） | `src/docs/03.地图基础操作.md` |
| 04 | 地图控件 | NavigationControl、ScaleControl、GeolocateControl、FullscreenControl、AttributionControl、自定义控件（IControl 接口） | `src/docs/04.地图控件.md` |

### 第二阶段：样式与数据源（第5-8节）

| 节次 | 标题 | 核心内容 | 文档路径 |
|------|------|---------|---------|
| 05 | 地图样式（Style）详解 | Style Specification 结构、version/sources/layers/glyphs/sprite、在线样式 vs 本地样式 JSON、动态切换样式 | `src/docs/05.地图样式详解.md` |
| 06 | 数据源（Sources） | vector / raster / raster-dem / geojson / image / video 六大数据源类型、TileJSON 规范、瓦片 URL 模板 `{z}/{x}/{y}` | `src/docs/06.数据源Sources.md` |
| 07 | GeoJSON 数据实战 | GeoJSON 规范（Point/LineString/Polygon/Multi*/GeometryCollection/Feature/FeatureCollection）、动态加载与更新 GeoJSON、坐标系与投影 | `src/docs/07.GeoJSON数据实战.md` |
| 08 | 矢量瓦片与栅格瓦片 | 矢量瓦片（MVT/PBF）原理、栅格瓦片（XYZ/TMS/WMTS）、自建瓦片服务（Martin/Tippecanoe）、常用免费瓦片源汇总 | `src/docs/08.矢量瓦片与栅格瓦片.md` |

### 第三阶段：图层类型精讲（第9-14节）

| 节次 | 标题 | 核心内容 | 文档路径 |
|------|------|---------|---------|
| 09 | Fill 填充图层 | 多边形渲染、fill-color/fill-opacity/fill-outline-color/fill-pattern、行政区域填色地图实战 | `src/docs/09.Fill填充图层.md` |
| 10 | Line 线图层 | 线段渲染、line-width/line-color/line-dasharray/line-cap/line-join、路线轨迹绘制实战 | `src/docs/10.Line线图层.md` |
| 11 | Symbol 符号图层 | 文本标注与图标、text-field/text-size/icon-image、Sprite 雪碧图机制、自定义图标（addImage）、碰撞检测 | `src/docs/11.Symbol符号图层.md` |
| 12 | Circle 圆点图层 | 散点分布图、circle-radius/circle-color/circle-stroke-*、数据驱动样式（按属性映射大小/颜色） | `src/docs/12.Circle圆点图层.md` |
| 13 | Heatmap 热力图层 | 热力图原理、heatmap-weight/heatmap-intensity/heatmap-radius/heatmap-color、密度可视化实战 | `src/docs/13.Heatmap热力图层.md` |
| 14 | Fill-extrusion 3D 建筑图层 | 3D 拉伸效果、fill-extrusion-height/fill-extrusion-base/fill-extrusion-color、城市建筑 3D 可视化 | `src/docs/14.FillExtrusion3D建筑图层.md` |

### 第四阶段：交互与覆盖物（第15-18节）

| 节次 | 标题 | 核心内容 | 文档路径 |
|------|------|---------|---------|
| 15 | Marker 标记点 | Marker 创建与自定义 DOM、拖拽 Marker、Marker 与 Popup 联动 | `src/docs/15.Marker标记点.md` |
| 16 | Popup 弹窗 | Popup 创建与定位、setHTML/setDOMContent、样式自定义、关闭事件处理 | `src/docs/16.Popup弹窗.md` |
| 17 | 要素交互 | queryRenderedFeatures / querySourceFeatures、鼠标悬停高亮、点击弹出详情、要素状态（setFeatureState） | `src/docs/17.要素交互.md` |
| 18 | 绘制与测量 | 使用 maplibre-gl-draw 或自研实现点/线/面绘制、距离测量、面积计算（Turf.js 辅助） | `src/docs/18.绘制与测量.md` |

### 第五阶段：表达式与高级样式（第19-22节）

| 节次 | 标题 | 核心内容 | 文档路径 |
|------|------|---------|---------|
| 19 | 表达式系统入门 | MapLibre 表达式语法、数据表达式 vs 相机表达式、`["get"]`/`["has"]`/`["=="]`/`["case"]`/`["match"]` | `src/docs/19.表达式系统入门.md` |
| 20 | 数据驱动样式 | 根据属性值动态设定颜色/大小/透明度、`["interpolate"]`/`["step"]` 插值与分段、分级设色地图实战 | `src/docs/20.数据驱动样式.md` |
| 21 | 图层过滤（Filter） | filter 表达式、按属性筛选要素、动态切换过滤条件、多条件组合 `["all"]`/`["any"]` | `src/docs/21.图层过滤Filter.md` |
| 22 | 运行时样式修改 | setPaintProperty / setLayoutProperty / setFilter / moveLayer / addLayer / removeLayer、图层顺序管理 | `src/docs/22.运行时样式修改.md` |

### 第六阶段：进阶功能（第23-27节）

| 节次 | 标题 | 核心内容 | 文档路径 |
|------|------|---------|---------|
| 23 | 聚合（Clustering） | GeoJSON Source cluster 参数、clusterMaxZoom/clusterRadius、聚合圆圈+计数标注、点击展开聚合 | `src/docs/23.聚合Clustering.md` |
| 24 | 动画效果 | 逐帧动画（requestAnimationFrame）、轨迹回放、数据源实时更新动画、相机飞行动画链 | `src/docs/24.动画效果.md` |
| 25 | 地形与 3D 天空 | raster-dem 地形源、setTerrain 开启 3D 地形、exaggeration 夸张系数、Sky Layer 天空效果、hillshade 山体阴影 | `src/docs/25.地形与3D天空.md` |
| 26 | 图片与视频叠加 | ImageSource 图片叠加（卫星影像/历史地图配准）、VideoSource 视频叠加、Canvas 源 | `src/docs/26.图片与视频叠加.md` |
| 27 | 自定义图层（CustomLayer） | addLayer 自定义 WebGL 图层、onAdd/render 生命周期、与 Three.js/Deck.gl 集成思路 | `src/docs/27.自定义图层CustomLayer.md` |

### 第七阶段：性能优化与工程实践（第28-31节）

| 节次 | 标题 | 核心内容 | 文档路径 |
|------|------|---------|---------|
| 28 | 性能优化 | 大数据量渲染策略、图层简化、视口裁剪、瓦片缓存、Web Worker、避免频繁 setData | `src/docs/28.性能优化.md` |
| 29 | Vue 组件封装 | 封装 MapContainer / MapMarker / MapPopup / MapLayer 等可复用 Vue 组件、组合式函数 useMap | `src/docs/29.Vue组件封装.md` |
| 30 | 地图项目工程化 | 项目目录结构设计、地图样式管理、环境变量与 API Key 管理、打包部署注意事项 | `src/docs/30.地图项目工程化.md` |
| 31 | 地图服务与后端对接 | GeoServer/MapServer/Martin 对接、WMS/WFS/WMTS 协议、PostGIS 空间查询、前后端数据流 | `src/docs/31.地图服务与后端对接.md` |

### 第八阶段：实战项目（第32-35节）

| 节次 | 标题 | 核心内容 | 文档路径 |
|------|------|---------|---------|
| 32 | 实战：土壤检测可视化 | 多指标分级设色、筛选联动、图例组件、Popup 详情展示（本项目已有） | `src/docs/32.实战-土壤检测可视化.md` |
| 33 | 实战：轨迹回放系统 | GPS 轨迹数据加载、路线动画、速度/方向实时展示、时间轴控制 | `src/docs/33.实战-轨迹回放系统.md` |
| 34 | 实战：区域数据看板 | 行政区划边界加载、点击下钻、统计图表联动（ECharts/AntV）、数据面板 | `src/docs/34.实战-区域数据看板.md` |
| 35 | 实战：智慧园区地图 | 室内地图/楼层切换、设备点位标注、实时告警高亮、3D 建筑模型 | `src/docs/35.实战-智慧园区地图.md` |

---

## 项目目录结构

```
maplibre-base/
├── src/
│   ├── assets/          # 静态资源
│   ├── components/      # 通用组件（MapLegend、MapFilter 等）
│   ├── docs/            # 📚 学习文档（01.xxx.md ~ 35.xxx.md）
│   ├── layouts/         # 布局组件（AppLayout 侧边栏布局）
│   ├── mock/            # Mock 数据
│   ├── router/          # 路由配置
│   ├── views/           # 页面组件
│   │   ├── SoilPhMap.vue       # 土壤pH分布图
│   │   ├── bindmap/            # 地图可视化页面
│   │   └── bindtools/          # 地图工具页面
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── public/
├── index.html
├── package.json
├── vite.config.ts
└── README.md            # 👈 你正在看的这个文件
```

---

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

---

## 参考资源

- [MapLibre GL JS 官方文档](https://maplibre.org/maplibre-gl-js/docs/)
- [MapLibre Style Specification](https://maplibre.org/maplibre-style-spec/)
- [GeoJSON 规范 (RFC 7946)](https://datatracker.ietf.org/doc/html/rfc7946)
- [Turf.js 空间分析库](https://turfjs.org/)
- [Ant Design Vue](https://antdv.com/)
