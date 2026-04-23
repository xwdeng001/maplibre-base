<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  EnvironmentOutlined,
  GlobalOutlined,
  HeatMapOutlined,
  DotChartOutlined,
  AreaChartOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GithubOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()

/** 侧边栏是否折叠 */
const collapsed = ref(false)

/** 当前选中的菜单项 */
const selectedKeys = ref<string[]>([])

/** 当前展开的子菜单 */
const openKeys = ref<string[]>(['map-demos'])

/** 根据当前路由同步菜单状态 */
watch(
  () => route.path,
  (path) => {
    selectedKeys.value = [path]
  },
  { immediate: true }
)

/** 面包屑 */
const breadcrumbs = computed(() => {
  const matched = route.matched
  return matched
    .filter(r => r.meta?.title)
    .map(r => ({ title: r.meta.title as string }))
})

/** 菜单点击 */
function handleMenuClick({ key }: { key: string }) {
  router.push(key)
}
</script>

<template>
  <a-layout class="main-layout">
    <!-- 左侧侧边栏 -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :trigger="null"
      collapsible
      :width="220"
      :collapsed-width="64"
      class="layout-sider"
    >
      <!-- Logo 区域 -->
      <div class="sider-logo">
        <GlobalOutlined class="logo-icon" />
        <span v-show="!collapsed" class="logo-text">MapLibre 展示</span>
      </div>

      <!-- 导航菜单 -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        theme="dark"
        @click="handleMenuClick"
      >
        <a-sub-menu key="map-demos">
          <template #icon><EnvironmentOutlined /></template>
          <template #title>地图展示</template>

          <a-menu-item key="/soil-ph">
            <template #icon><HeatMapOutlined /></template>
            土壤pH分布
          </a-menu-item>

          <a-menu-item key="/bindian" disabled>
            <template #icon><DotChartOutlined /></template>
            标点聚合（开发中）
          </a-menu-item>

          <a-menu-item key="/binduan" disabled>
            <template #icon><AreaChartOutlined /></template>
            热力图（开发中）
          </a-menu-item>
        </a-sub-menu>
      </a-menu>

      <!-- 底部 GitHub 链接 -->
      <div class="sider-footer" v-show="!collapsed">
        <a
          href="https://github.com"
          target="_blank"
          class="github-link"
        >
          <GithubOutlined />
          <span>GitHub</span>
        </a>
      </div>
    </a-layout-sider>

    <!-- 右侧内容区 -->
    <a-layout>
      <!-- 顶部标题栏 -->
      <a-layout-header class="layout-header">
        <div class="header-left">
          <!-- 折叠按钮 -->
          <span class="trigger" @click="collapsed = !collapsed">
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </span>

          <!-- 面包屑 -->
          <a-breadcrumb class="header-breadcrumb">
            <a-breadcrumb-item>首页</a-breadcrumb-item>
            <a-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
              {{ item.title }}
            </a-breadcrumb-item>
          </a-breadcrumb>
        </div>

        <div class="header-right">
          <span class="header-tag">MapLibre GL JS</span>
          <span class="header-tag vue-tag">Vue 3</span>
        </div>
      </a-layout-header>

      <!-- 主内容区 -->
      <a-layout-content class="layout-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.main-layout {
  min-height: 100vh;
}

/* 侧边栏 */
.layout-sider {
  background: #001529 !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-sider :deep(.ant-layout-sider-children) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Logo */
.sider-logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-icon {
  font-size: 24px;
  color: #1890ff;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

/* 菜单样式 */
.layout-sider :deep(.ant-menu) {
  flex: 1;
  border-right: none;
}

/* 侧边栏底部 */
.sider-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.github-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s;
}

.github-link:hover {
  color: rgba(255, 255, 255, 0.85);
}

/* 顶部标题栏 */
.layout-header {
  background: #fff !important;
  padding: 0 20px !important;
  height: 56px !important;
  line-height: 56px !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trigger {
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  color: #333;
  transition: background 0.2s;
}

.trigger:hover {
  background: #f0f0f0;
}

.header-breadcrumb {
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-tag {
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.vue-tag {
  background: #f6ffed;
  color: #52c41a;
  border-color: #b7eb8f;
}

/* 主内容区 */
.layout-content {
  position: relative;
  overflow: hidden;
}
</style>
