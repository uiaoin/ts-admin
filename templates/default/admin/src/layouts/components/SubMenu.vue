<template>
  <a-sub-menu :key="String(menu.id)">
    <template #title>
      <component :is="getIcon(menu.icon)" v-if="menu.icon" />
      <span>{{ menu.name }}</span>
    </template>
    <template v-for="child in menu.children" :key="child.id">
      <SubMenu v-if="child.children && child.children.length > 0" :menu="child" />
      <MenuItem v-else :menu="child" />
    </template>
  </a-sub-menu>
</template>

<script setup lang="ts">
import * as Icons from '@ant-design/icons-vue';
import MenuItem from './MenuItem.vue';

defineProps<{
  menu: any;
}>();

// 动态获取图标组件
function getIcon(iconName: string | null) {
  if (!iconName) return null;
  return (Icons as any)[iconName] || null;
}
</script>
