# MapLibre 课程知识点文档

与 `src/views/stage*/Lesson*.vue` 一一对应，供复习与面试速查。建议：**先跑 Demo → 再读对应 md → 回看源码**。

## 第一阶段：入门基础

| 课次 | 文档 | Vue 页面 |
|------|------|----------|
| 01 | [认识 MapLibre GL JS](./01-认识-MapLibre-GL-JS.md) | `stage1/Lesson01_MapIntro.vue` |
| 02 | [第一张地图 — Map 构造参数](./02-第一张地图-Map构造参数.md) | `stage1/Lesson02_FirstMap.vue` |
| 03 | [地图基础操作](./03-地图基础操作.md) | `stage1/Lesson03_MapOperations.vue` |
| 04 | [地图控件](./04-地图控件.md) | `stage1/Lesson04_MapControls.vue` |

## 第二阶段：样式与数据源

| 课次 | 文档 | Vue 页面 |
|------|------|----------|
| 05 | [地图样式详解](./05-地图样式详解.md) | `stage2/Lesson05_MapStyles.vue` |
| 06 | [数据源 Sources](./06-数据源-Sources.md) | `stage2/Lesson06_Sources.vue` |
| 07 | [GeoJSON 数据实战](./07-GeoJSON数据实战.md) | `stage2/Lesson07_GeoJSON.vue` |
| 08 | [矢量瓦片与栅格瓦片](./08-矢量瓦片与栅格瓦片.md) | `stage2/Lesson08_Tiles.vue` |

## 第三阶段：图层类型

| 课次 | 文档 | Vue 页面 |
|------|------|----------|
| 09 | [Fill 填充图层](./09-Fill填充图层.md) | `stage3/Lesson09_Fill.vue` |
| 10 | [Line 线图层](./10-Line线图层.md) | `stage3/Lesson10_Line.vue` |
| 11 | [Symbol 符号图层](./11-Symbol符号图层.md) | `stage3/Lesson11_Symbol.vue` |
| 12 | [Circle 圆点图层](./12-Circle圆点图层.md) | `stage3/Lesson12_Circle.vue` |
| 13 | [Heatmap 热力图层](./13-Heatmap热力图层.md) | `stage3/Lesson13_Heatmap.vue` |
| 14 | [Fill-extrusion 3D 建筑](./14-Fill-extrusion-3D建筑.md) | `stage3/Lesson14_FillExtrusion.vue` |

## 第四阶段：交互与覆盖物

| 课次 | 文档 | Vue 页面 |
|------|------|----------|
| 15 | [Marker 标记点](./15-Marker标记点.md) | `stage4/Lesson15_Marker.vue` |
| 16 | [Popup 弹窗](./16-Popup弹窗.md) | `stage4/Lesson16_Popup.vue` |
| 17 | [要素交互](./17-要素交互.md) | `stage4/Lesson17_Interaction.vue` |
| 18 | [绘制与测量](./18-绘制与测量.md) | `stage4/Lesson18_Draw.vue` |

## 第五阶段：表达式与高级样式

| 课次 | 文档 | Vue 页面 |
|------|------|----------|
| 19 | [表达式系统入门](./19-表达式系统入门.md) | `stage5/Lesson19_Expressions.vue` |
| 20 | [数据驱动样式](./20-数据驱动样式.md) | `stage5/Lesson20_DataDriven.vue` |
| 21 | [图层过滤 Filter](./21-图层过滤-Filter.md) | `stage5/Lesson21_Filter.vue` |
| 22 | [运行时样式修改](./22-运行时样式修改.md) | `stage5/Lesson22_RuntimeStyle.vue` |

## 学习路径建议

```
01 概念 → 02 Map 生命周期 → 03 相机/事件 → 04 控件
    → 05 Style → 06–08 数据与瓦片
    → 09–14 图层类型（面试高频）
    → 15–18 交互与绘制
    → 19–22 表达式与运行时 API（项目实战）
```

公共底图配置：`src/utils/mapStyles.ts`（天地图 + `VITE_TIANDITU_KEY`）。