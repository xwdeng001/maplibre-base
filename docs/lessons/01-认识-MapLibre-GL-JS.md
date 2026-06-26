# 01 认识 MapLibre GL JS

> 对应页面：`src/views/stage1/Lesson01_MapIntro.vue`

## 学习目标

- 理解 MapLibre GL JS 的定位、历史与许可
- 能在面试中对比 Leaflet / OpenLayers / Cesium
- 知道典型业务场景与选型理由

## 核心概念

### 是什么

**MapLibre GL JS** 是面向 Web 的 **WebGL 矢量地图渲染引擎**，由 Mapbox GL JS v1 分叉而来，采用 **BSD-3** 协议，**无 Mapbox 商业 token 限制**，适合政企、内网、长期维护的项目。

渲染链路大致为：

```
Style JSON → Sources（数据）→ Layers（绘制规则）→ WebGL 绘制
```

### 八大特性（面试可背）

| 特性 | 说明 |
|------|------|
| 矢量渲染 | 矢量瓦片在客户端 GPU 绘制，缩放清晰、样式可改 |
| 开源免费 | BSD-3，可商用、可改源码 |
| 高性能 | 大量点/线/面可走 GPU；热力、聚合等有成熟方案 |
| 3D | pitch、bearing、fill-extrusion、terrain、globe |
| 表达式 | 按属性动态颜色、宽度、可见性 |
| 移动端 | 触摸缩放、旋转；注意内存与瓦片缓存 |
| 生态 | Style Spec、Mapbox 系插件/工具多数兼容 |
| TypeScript | 官方类型完善，`StyleSpecification` 等可直接用 |

### 与其他库对比（选型）

| 维度 | MapLibre | Leaflet | OpenLayers | Cesium |
|------|----------|---------|------------|--------|
| 渲染 | WebGL 矢量为主 | DOM/Canvas，偏栅格 | Canvas/WebGL，GIS 全 | WebGL 三维地球 |
| 体积 | ~250KB 级 | 最小 | 较大 | 很大 |
| 矢量瓦片 | 原生 | 需插件 | 原生 | 非核心 |
| 3D 地形/建筑 | 支持 | 弱 | 弱 | 强项 |
| 学习成本 | 中（要懂 Style/Layer） | 低 | 高 | 高 |

**何时选 MapLibre：**

- 需要 **矢量底图 + 数据驱动样式 + 较好 3D**
- 需要 **与 Mapbox Style 生态对齐** 又 **不想被商业授权绑死**
- 专题图、轨迹、大屏、城市可视化

**何时不选：**

- 只要简单打点、瓦片图 → Leaflet 更快上手
- 全球三维仿真、卫星轨道 → Cesium
- 重度 OGC、复杂投影、传统 GIS 编辑 → OpenLayers

## 典型应用场景

- 专题地图（choropleth、分级设色）
- 实时轨迹（车辆、骑手、巡检）
- 智慧城市 / 管网 / 设施
- 农业地块、土壤点位
- 数据看板地理维度
- 园区数字孪生（常与 extrusion、自定义 3D 结合）

## 与后续课程的关系

| 后续课 | 衔接 |
|--------|------|
| 02 第一张地图 | `new maplibregl.Map`、camera 参数 |
| 05 样式 | Style Specification |
| 06–08 数据与瓦片 | sources、GeoJSON、vector/raster |
| 09–14 图层类型 | fill / line / symbol / circle / heatmap / extrusion |
| 15–18 交互 | Marker、Popup、query、绘制 |

## 面试常见问题

1. **MapLibre 和 Mapbox GL JS 区别？**  
   同源分叉；MapLibre 开源无 Mapbox 商业条款；API 高度相似，迁移成本低。

2. **矢量瓦片和栅格瓦片的区别？**  
   栅格是预渲染图片；矢量是几何+属性，客户端按 style 绘制，可改样式、可交互到要素级（vector tile 需合适 layer）。

3. **WebGL 地图和 Canvas/DOM 地图优劣？**  
   WebGL 适合大数据量、统一符号化、3D；DOM 适合极简场景和旧浏览器（MapLibre 仍需 WebGL）。

## 扩展阅读

- [MapLibre GL JS 文档](https://maplibre.org/maplibre-gl-js/docs/)
- [MapLibre Style Spec](https://maplibre.org/maplibre-style-spec/)
- 样式编辑器：Maputnik