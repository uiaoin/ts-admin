<template>
  <a-breadcrumb class="breadcrumb">
    <a-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
      <router-link v-if="item.path && item.path !== route.path" :to="item.path">
        {{ item.title }}
      </router-link>
      <span v-else>{{ item.title }}</span>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores';

const route = useRoute();
const userStore = useUserStore();

interface BreadcrumbItem {
  title: string;
  path?: string;
}

const breadcrumbs = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = [{ title: '首页', path: '/dashboard' }];

  // 根据当前路由查找菜单
  const currentMenu = userStore.menus.find((m) => m.path === route.path);
  if (!currentMenu) {
    return items;
  }

  // 向上查找所有父级
  const chain: any[] = [];
  let current = currentMenu;

  while (current) {
    chain.unshift(current);
    if (current.parentId === 0) break;
    current = userStore.menus.find((m) => m.id === current.parentId) as any;
  }

  // 添加到面包屑
  chain.forEach((menu) => {
    items.push({
      title: menu.name,
      path: menu.path || undefined,
    });
  });

  return items;
});
</script>

<style lang="less" scoped>
.breadcrumb {
  margin-left: 8px;
}
</style>
