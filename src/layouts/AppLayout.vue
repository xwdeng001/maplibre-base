<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  LayoutOutlined,
  GlobalOutlined,
  HeatMapOutlined,
  DotChartOutlined,
  EnvironmentOutlined,
  AimOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GithubOutlined,
  SettingOutlined,
  ExperimentOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

/** 侧边栏折叠状态 */
const collapsed = ref(false)

/** 当前选中的菜单项 */
const selectedKeys = ref<string[]>([route.path])

/** 当前展开的子菜单 */
const openKeys = ref<string[]>([])

/** 面包屑导航 */
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(r => r.meta?.title)
  return matched.map(r => ({
    title: r.meta.title as string,
    path: r.path
  }))
})

/** 监听路由变化，同步菜单选中状态 */
watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path]
    /** 自动展开父级菜单 */
    const parent = route.matched.find(r => r.children && r.children.length > 0)
    if (parent && parent.path) {
      openKeys.value = [parent.path]
    }
  },
  { immediate: true }
)

/** 菜单点击跳转 */
function handleMenuClick({ key }: { key: string }) {
  router.push(key)
}
</script>

<template>
  <a-layout class="app-layout">
    <!-- 左侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :width="220"
      :collapsed-width="64"
      class="app-sider"
    >
      <!-- Logo 区域 -->
      <div class="sider-logo">
        <GlobalOutlined class="logo-icon" />
        <span v-show="!collapsed" class="logo-text">MapLibre 地图</span>
      </div>

      <!-- 菜单 -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        theme="dark"
        mode="inline"
        @click="handleMenuClick"
      >
        <!-- 土壤检测分析 -->
        <a-sub-menu key="/soil">
          <template #icon><ExperimentOutlined /></template>
          <template #title>土壤检测分析</template>
          <a-menu-item key="/soil-ph">
            <template #icon><HeatMapOutlined /></template>
            土壤pH分布图
          </a-menu-item>
        </a-sub-menu>

        <!-- 地图可视化 -->
        <a-sub-menu key="/bindmap">
          <template #icon><EnvironmentOutlined /></template>
          <template #title>地图可视化</template>
          <a-menu-item key="/bindmap/bindmap1">
            <template #icon><DotChartOutlined /></template>
            地图基础展示
          </a-menu-item>
        </a-sub-menu>

        <!-- 地图工具 -->
        <a-sub-menu key="/bindtools">
          <template #icon><AimOutlined /></template>
          <template #title>地图工具</template>
          <a-menu-item key="/bindtools/bindtool1">
            <template #icon><LayoutOutlined /></template>
            标注与测量
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
          <a
            href="https://maplibre.org/maplibre-gl-js/docs/"
            target="_blank"
            class="header-action"
            title="MapLibre 文档"
          >
            <GithubOutlined />
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

.header-action:hover {
  background: #f0f2f5;
  color: #1890ff;
}

/* 内容区域 */
.app-content {
  margin: 0;
  overflow: auto;
  position: relative;
}
</style>
