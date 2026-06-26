# 21 图层过滤 Filter

> 对应页面：`src/views/stage5/Lesson21_Filter.vue`

## 学习目标

- 在 layer 上用 **filter** 按属性显示/隐藏要素
- 组合 `all` / `any` 多条件
- 运行时 `setFilter` 动态更新

## Filter 是什么

Filter 是表达式，结果为 **boolean**，为真则绘制该要素：

```ts
map.addLayer({
  id: 'poi',
  type: 'circle',
  source: 'points',
  filter: ['==', ['get', 'type'], '景点']
})
```

## 常用运算符

| 运算符 | 含义 |
|--------|------|
| `==`, `!=` | 相等 / 不等 |
| `>`, `>=`, `<`, `<=` | 数值比较 |
| `in` | 值在集合中 |
| `all` | 全部成立 |
| `any` | 任一成立 |
| `!` | 取反 |

## 本课：类型 + 数值组合

```ts
function buildFilter() {
  const conditions = []

  // type in ['景点','公园']
  if (filterType.value.length < allTypes.length) {
    conditions.push(['in', ['get', 'type'], ['literal', filterType.value]])
  }

  conditions.push(['>=', ['get', 'value'], filterMinValue.value])

  if (conditions.length === 0) return null
  if (conditions.length === 1) return conditions[0]
  return [filterLogic.value, ...conditions]  // 'all' 或 'any'
}
```

`null` filter 表示 **不过滤**（显示全部）。

## 动态更新

```ts
map.setFilter('poi-layer', buildFilter())
```

无需 `setData`；数据仍在 source 中，只是不绘制不满足条件的 feature。

## 统计可见数量

可用 `map.querySourceFeatures('sourceId')` 在内存中再过滤属性计数（注意与 filter 逻辑保持一致），或维护业务侧统计。

## Filter vs 业务侧删数据

| | setFilter | 从 GeoJSON 删 feature |
|--|-----------|------------------------|
| 性能 | 数据仍在，GPU 跳过 | setData 重传 |
| 交互 | query 可能仍返回被滤掉要素 | 真删除 |
| 适用 | UI 筛选 | 权限/裁剪 |

## 常见坑

1. `in` 的数组要用 `['literal', ['a','b']]` 包裹
2. 字符串与数字比较失败 → `to-number`
3. filter 只影响 **该 layer**，同源其他 layer 不受影响

## 面试要点

- **layer filter** 与 **表达式 case** 区别：filter 不绘制；case 可绘制成透明
- 矢量瓦片 filter 在客户端执行，仍下载瓦片

## 练习

- 切换 `all` vs `any` 观察结果
- 增加 `['has', 'name']` 过滤无名字要素