<template>
  <a-menu
    v-model:selectedKeys="selectedKeys"
    v-model:openKeys="openKeys"
    mode="inline"
    theme="dark"
    :inline-collapsed="appStore.sidebarCollapsed"
    @click="handleMenuClick"
  >
    <template v-for="menu in menuTree" :key="menu.id">
      <SubMenu v-if="menu.children && menu.children.length > 0" :menu="menu" />
      <MenuItem v-else :menu="menu" />
    </template>
  </a-menu>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore, useAppStore } from '@/stores';
import { listToTree } from '@ts-admin/utils';
import SubMenu from './SubMenu.vue';
import MenuItem from './MenuItem.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const appStore = useAppStore();

// 菜单树
const menuTree = computed(() => {
  const menus = userStore.menus.filter((m) => m.type !== 2 && m.visible === 1);
  return listToTree(menus);
});

// 当前选中的菜单
const selectedKeys = ref<string[]>([]);
// 展开的菜单
const openKeys = ref<string[]>([]);

// 监听路由变化，更新选中状态
watch(
  () => route.path,
  (path) => {
    const menu = userStore.menus.find((m) => m.path === path);
    if (menu) {
      selectedKeys.value = [String(menu.id)];

      // 展开父菜单
      const parentIds = findParentIds(menu.parentId);
      openKeys.value = parentIds.map(String);
    }
  },
  { immediate: true },
);

// 查找所有父级ID
function findParentIds(parentId: number): number[] {
  const ids: number[] = [];
  let current = parentId;

  while (current !== 0) {
    ids.push(current);
    const parent = userStore.menus.find((m) => m.id === current);
    if (parent) {
      current = parent.parentId;
    } else {
      break;
    }
  }

  return ids;
}

// 点击菜单
function handleMenuClick({ key }: { key: string }) {
  const menu = userStore.menus.find((m) => String(m.id) === key);
  if (menu?.path) {
    if (menu.isExternal === 1) {
      window.open(menu.path, '_blank');
    } else {
      router.push(menu.path);
    }
  }
}
</script>
