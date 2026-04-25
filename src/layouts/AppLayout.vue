<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  GlobalOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GithubOutlined,
  SettingOutlined,
  ReadOutlined,
  RocketOutlined,
  CompassOutlined,
  ControlOutlined,
  InfoCircleOutlined,
  FormatPainterOutlined,
  DatabaseOutlined,
  NodeIndexOutlined,
  BlockOutlined,
  HighlightOutlined,
  DashOutlined,
  FontSizeOutlined,
  AimOutlined,
  FireOutlined,
  BuildOutlined,
  EnvironmentOutlined,
  MessageOutlined,
  SelectOutlined,
  EditOutlined,
  FunctionOutlined,
  BgColorsOutlined,
  FilterOutlined,
  ToolOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

/** 侧边栏折叠状态 */
const collapsed = ref(false)

/** 当前选中的菜单项 */
const selectedKeys = ref<string[]>([route.path])

/** 子菜单 key 列表，用于自动展开匹配的父菜单 */
const subMenuKeys = ['/stage1', '/stage2', '/stage3', '/stage4', '/stage5', '/stage6', '/stage7', '/stage8']

/** 根据路径推断所属的父菜单 key */
function getParentMenuKey(path: string): string {
  for (const key of subMenuKeys) {
    if (path === key || path.startsWith(key + '/')) {
      return key
    }
  }
  return ''
}

/** 当前展开的子菜单 */
const openKeys = ref<string[]>([getParentMenuKey(route.path)])

/** 面包屑导航 */
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(r => r.meta?.title)
  return matched.map(r => ({
    title: r.meta.title as string,
    path: r.path
  }))
})

/** 监听路由变化，同步菜单选中状态，只展开当前路由对应的父菜单（手风琴模式） */
watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path]
    const parentKey = getParentMenuKey(path)
    if (parentKey) {
      openKeys.value = [parentKey]
    }
  },
  { immediate: true }
)

/** 手风琴模式：同一时间只展开一个子菜单 */
function handleOpenChange(keys: string[]) {
  const latestKey = keys.find(k => !openKeys.value.includes(k))
  if (latestKey && subMenuKeys.includes(latestKey)) {
    openKeys.value = [latestKey]
  } else {
    openKeys.value = keys.filter(k => subMenuKeys.includes(k))
  }
}

/** 菜单点击跳转 */
function handleMenuClick({ key }: { key: string }) {
  router.push(key)
}
</script>

<template>
  <a-layout class="app-layout">
    <!-- 左侧边栏 -->
    <a-layout-sider v-model:collapsed="collapsed" :trigger="null" collapsible :width="220" :collapsed-width="64"
      class="app-sider">
      <!-- Logo 区域 -->
      <div class="sider-logo">
        <GlobalOutlined class="logo-icon" />
        <span v-show="!collapsed" class="logo-text">MapLibre 地图</span>
      </div>

      <!-- 菜单 -->
      <a-menu v-model:selectedKeys="selectedKeys" :openKeys="openKeys" theme="dark" mode="inline"
        @click="handleMenuClick" @openChange="handleOpenChange">
        <!-- 第一阶段：入门基础 -->
        <a-sub-menu key="/stage1">
          <template #icon>
            <ReadOutlined />
          </template>
          <template #title>一、入门基础</template>
          <a-menu-item key="/stage1/lesson01">
            <template #icon>
              <InfoCircleOutlined />
            </template>
            01.认识MapLibre
          </a-menu-item>
          <a-menu-item key="/stage1/lesson02">
            <template #icon>
              <RocketOutlined />
            </template>
            02.第一张地图
          </a-menu-item>
          <a-menu-item key="/stage1/lesson03">
            <template #icon>
              <CompassOutlined />
            </template>
            03.地图基础操作
          </a-menu-item>
          <a-menu-item key="/stage1/lesson04">
            <template #icon>
              <ControlOutlined />
            </template>
            04.地图控件
          </a-menu-item>
        </a-sub-menu>

        <!-- 第二阶段：样式与数据源 -->
        <a-sub-menu key="/stage2">
          <template #icon>
            <FormatPainterOutlined />
          </template>
          <template #title>二、样式与数据源</template>
          <a-menu-item key="/stage2/lesson05">
            <template #icon>
              <FormatPainterOutlined />
            </template>
            05.地图样式详解
          </a-menu-item>
          <a-menu-item key="/stage2/lesson06">
            <template #icon>
              <DatabaseOutlined />
            </template>
            06.数据源Sources
          </a-menu-item>
          <a-menu-item key="/stage2/lesson07">
            <template #icon>
              <NodeIndexOutlined />
            </template>
            07.GeoJSON数据实战
          </a-menu-item>
          <a-menu-item key="/stage2/lesson08">
            <template #icon>
              <BlockOutlined />
            </template>
            08.矢量瓦片与栅格瓦片
          </a-menu-item>
        </a-sub-menu>

        <!-- 第三阶段：图层类型精讲 -->
        <a-sub-menu key="/stage3">
          <template #icon>
            <HighlightOutlined />
          </template>
          <template #title>三、图层类型精讲</template>
          <a-menu-item key="/stage3/lesson09">
            <template #icon>
              <HighlightOutlined />
            </template>
            09.Fill填充图层
          </a-menu-item>
          <a-menu-item key="/stage3/lesson10">
            <template #icon>
              <DashOutlined />
            </template>
            10.Line线图层
          </a-menu-item>
          <a-menu-item key="/stage3/lesson11">
            <template #icon>
              <FontSizeOutlined />
            </template>
            11.Symbol符号图层
          </a-menu-item>
          <a-menu-item key="/stage3/lesson12">
            <template #icon>
              <AimOutlined />
            </template>
            12.Circle圆点图层
          </a-menu-item>
          <a-menu-item key="/stage3/lesson13">
            <template #icon>
              <FireOutlined />
            </template>
            13.Heatmap热力图层
          </a-menu-item>
          <a-menu-item key="/stage3/lesson14">
            <template #icon>
              <BuildOutlined />
            </template>
            14.Fill-extrusion 3D建筑
          </a-menu-item>
        </a-sub-menu>

        <!-- 第四阶段：交互与覆盖物 -->
        <a-sub-menu key="/stage4">
          <template #icon>
            <SelectOutlined />
          </template>
          <template #title>四、交互与覆盖物</template>
          <a-menu-item key="/stage4/lesson15">
            <template #icon>
              <EnvironmentOutlined />
            </template>
            15.Marker标记点
          </a-menu-item>
          <a-menu-item key="/stage4/lesson16">
            <template #icon>
              <MessageOutlined />
            </template>
            16.Popup弹窗
          </a-menu-item>
          <a-menu-item key="/stage4/lesson17">
            <template #icon>
              <SelectOutlined />
            </template>
            17.要素交互
          </a-menu-item>
          <a-menu-item key="/stage4/lesson18">
            <template #icon>
              <EditOutlined />
            </template>
            18.绘制与测量
          </a-menu-item>
        </a-sub-menu>

        <!-- 第五阶段：表达式与高级样式 -->
        <a-sub-menu key="/stage5">
          <template #icon>
            <FunctionOutlined />
          </template>
          <template #title>五、表达式与高级样式</template>
          <a-menu-item key="/stage5/lesson19">
            <template #icon>
              <FunctionOutlined />
            </template>
            19.表达式系统入门
          </a-menu-item>
          <a-menu-item key="/stage5/lesson20">
            <template #icon>
              <BgColorsOutlined />
            </template>
            20.数据驱动样式
          </a-menu-item>
          <a-menu-item key="/stage5/lesson21">
            <template #icon>
              <FilterOutlined />
            </template>
            21.图层过滤Filter
          </a-menu-item>
          <a-menu-item key="/stage5/lesson22">
            <template #icon>
              <ToolOutlined />
            </template>
            22.运行时样式修改
          </a-menu-item>
        </a-sub-menu>

      </a-menu>
    </a-layout-sider>

    <!-- 右侧区域 -->
    <a-layout class="app-main">
      <!-- 顶部导航栏 -->
      <a-layout-header class="app-header">
        <div class="header-left">
          <!-- 折叠按钮 -->
          <span class="trigger" @click="collapsed = !collapsed">
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </span>
          <!-- 面包屑 -->
          <a-breadcrumb class="header-breadcrumb">
            <a-breadcrumb-item>首页</a-breadcrumb-item>
            <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <div class="header-right">
          <strong>[个人微信: 1576554007 欢迎一起学习交流]</strong>
          欢迎给仓库点一个 Star,让更多同学找到这份资料
          <a href="https://github.com/xwdeng001/maplibre-base.git" target="_blank"
            class="header-action header-link-action" title="Github 仓库">
            <GithubOutlined />
            <span class="header-action-label">GitHub获取本项目源码</span>
          </a>
          <a href="https://gitee.com/JuliusDeng/maplibre-base.git" target="_blank"
            class="header-action header-link-action" title="Gitee 仓库">
            <span class="header-text-icon">G</span>
            <span class="header-action-label">码云获取本项目源码</span>
          </a>
          <span class="header-action" title="设置">
            <SettingOutlined />
          </span>
        </div>
      </a-layout-header>

      <!-- 内容区域 -->
      <a-layout-content class="app-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  height: 100vh;
}

/* 侧边栏 */
.app-sider {
  background: #001529 !important;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

/* Logo */
.sider-logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  white-space: nowrap;
}

.logo-icon {
  font-size: 24px;
  color: #1890ff;
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-left: 10px;
  transition: opacity 0.3s;
}

/* 右侧主区域 */
.app-main {
  background: #f0f2f5;
  display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

/* 顶部导航栏 */
.app-header {
  background: #fff !important;
  padding: 0 20px !important;
  height: 56px !important;
  line-height: 56px !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  padding: 0 8px;
  color: #333;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.header-breadcrumb {
  line-height: 56px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  font-size: 16px;
  color: #555;
  cursor: pointer;
  transition: all 0.3s;
}

.header-link-action {
  width: auto;
  padding: 0 10px;
  gap: 6px;
}

.header-action-label {
  font-size: 12px;
  line-height: 1;
}

.header-text-icon {
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
}
.header-action:hover {
  background: #f0f2f5;
  color: #1890ff;
}

/* 内容区域 - flex:1 + height:0 确保高度正确传递给子组件 */
.app-content {
  margin: 0;
  overflow: hidden;
  position: relative;
  flex: 1;
    height: 0;
}
</style>
