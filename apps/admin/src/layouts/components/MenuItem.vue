<template>
  <a-menu-item :key="String(menu.id)">
    <component :is="getIcon(menu.icon)" v-if="menu.icon" />
    <span>{{ menu.name }}</span>
  </a-menu-item>
</template>

<script setup lang="ts">
import * as Icons from '@ant-design/icons-vue';

defineProps<{
  menu: any;
}>();

// 动态获取图标组件
function getIcon(iconName: string | null) {
  if (!iconName) return null;
  return (Icons as any)[iconName] || null;
}
</script>
