<template>
  <a-layout class="layout">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="appStore.sidebarCollapsed"
      :trigger="null"
      collapsible
      width="210"
      :collapsed-width="48"
      class="layout-sider"
    >
      <div class="logo">
        <img src="/vite.svg" alt="logo" />
        <span v-show="!appStore.sidebarCollapsed">TS Admin</span>
      </div>
      <SideMenu />
    </a-layout-sider>

    <a-layout>
      <!-- 顶部栏 -->
      <a-layout-header class="layout-header">
        <div class="header-left">
          <span class="trigger" @click="appStore.toggleSidebar">
            <MenuUnfoldOutlined v-if="appStore.sidebarCollapsed" />
            <MenuFoldOutlined v-else />
          </span>
          <Breadcrumb />
        </div>
        <div class="header-right">
          <a-dropdown>
            <div class="user-info">
              <a-avatar :size="28">
                {{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}
              </a-avatar>
              <span class="username">{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}</span>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item key="profile">
                  <UserOutlined />
                  <span>个人中心</span>
                </a-menu-item>
                <a-menu-item key="password" @click="showPasswordModal = true">
                  <LockOutlined />
                  <span>修改密码</span>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout" @click="handleLogout">
                  <LogoutOutlined />
                  <span>退出登录</span>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </a-layout-header>

      <!-- 内容区 -->
      <a-layout-content class="layout-content">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </a-layout-content>
    </a-layout>

    <!-- 修改密码弹窗 -->
    <ChangePasswordModal v-model:open="showPasswordModal" />
  </a-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Modal, message } from 'ant-design-vue';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LockOutlined,
  LogoutOutlined,
} from '@ant-design/icons-vue';
import { useUserStore, useAppStore } from '@/stores';
import { resetRouter } from '@/router';
import SideMenu from './components/SideMenu.vue';
import Breadcrumb from './components/Breadcrumb.vue';
import ChangePasswordModal from './components/ChangePasswordModal.vue';

const router = useRouter();
const userStore = useUserStore();
const appStore = useAppStore();

const showPasswordModal = ref(false);

// 退出登录
function handleLogout() {
  Modal.confirm({
    title: '提示',
    content: '确定要退出登录吗？',
    async onOk() {
      await userStore.logout();
      resetRouter();
      message.success('退出成功');
      router.push('/login');
    },
  });
}
</script>

<style lang="less" scoped>
.layout {
  min-height: 100vh;
}

.layout-sider {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  overflow: auto;
  z-index: 10;

  .logo {
    height: 64px;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);

    img {
      width: 32px;
      height: 32px;
    }

    span {
      margin-left: 12px;
      color: #fff;
      font-size: 18px;
      font-weight: 600;
      white-space: nowrap;
    }
  }
}

.layout-header {
  position: sticky;
  top: 0;
  z-index: 9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  margin-left: 210px;
  transition: margin-left 0.2s;

  .header-left {
    display: flex;
    align-items: center;

    .trigger {
      padding: 0 16px;
      font-size: 18px;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;
      padding: 0 12px;

      .username {
        margin-left: 8px;
      }
    }
  }
}

.layout-content {
  margin-left: 210px;
  padding: 16px;
  background: #f0f2f5;
  min-height: calc(100vh - 64px);
  transition: margin-left 0.2s;
}

// 侧边栏折叠时的样式
.ant-layout-sider-collapsed + .ant-layout {
  .layout-header,
  .layout-content {
    margin-left: 48px;
  }
}
</style>
