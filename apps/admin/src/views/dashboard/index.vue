<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
    <a-card class="welcome-card">
      <div class="welcome-content">
        <div class="welcome-text">
          <h2>{{ greeting }}，{{ userStore.userInfo?.nickname || userStore.userInfo?.username }}！</h2>
          <p>欢迎使用 TS Admin 后台管理系统</p>
        </div>
        <div class="welcome-avatar">
          <a-avatar :size="64" style="background-color: #1890ff">
            {{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}
          </a-avatar>
        </div>
      </div>
    </a-card>

    <!-- 统计卡片 -->
    <a-row :gutter="16" class="stat-row">
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="用户总数"
            :value="stats.userCount"
            :value-style="{ color: '#1890ff' }"
          >
            <template #prefix>
              <UserOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="角色总数"
            :value="stats.roleCount"
            :value-style="{ color: '#52c41a' }"
          >
            <template #prefix>
              <TeamOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="菜单总数"
            :value="stats.menuCount"
            :value-style="{ color: '#faad14' }"
          >
            <template #prefix>
              <MenuOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic
            title="部门总数"
            :value="stats.deptCount"
            :value-style="{ color: '#eb2f96' }"
          >
            <template #prefix>
              <ApartmentOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 快捷入口 -->
    <a-card title="快捷入口" class="quick-entry">
      <a-row :gutter="16">
        <a-col :span="6" v-for="entry in quickEntries" :key="entry.path">
          <div class="entry-item" @click="router.push(entry.path)">
            <component :is="entry.icon" class="entry-icon" />
            <span>{{ entry.title }}</span>
          </div>
        </a-col>
      </a-row>
    </a-card>

    <!-- 系统信息 -->
    <a-card title="系统信息" class="system-info">
      <a-descriptions :column="2">
        <a-descriptions-item label="框架名称">TS Admin</a-descriptions-item>
        <a-descriptions-item label="版本号">0.1.0</a-descriptions-item>
        <a-descriptions-item label="后端框架">NestJS</a-descriptions-item>
        <a-descriptions-item label="前端框架">Vue3 + Ant Design Vue</a-descriptions-item>
        <a-descriptions-item label="数据库">PostgreSQL</a-descriptions-item>
        <a-descriptions-item label="缓存">Redis</a-descriptions-item>
      </a-descriptions>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, h } from 'vue';
import { useRouter } from 'vue-router';
import {
  UserOutlined,
  TeamOutlined,
  MenuOutlined,
  ApartmentOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons-vue';
import { useUserStore } from '@/stores';

const router = useRouter();
const userStore = useUserStore();

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
});

// 统计数据
const stats = ref({
  userCount: 0,
  roleCount: 0,
  menuCount: 0,
  deptCount: 0,
});

// 快捷入口
const quickEntries = [
  { title: '用户管理', path: '/system/user', icon: h(UserOutlined) },
  { title: '角色管理', path: '/system/role', icon: h(TeamOutlined) },
  { title: '菜单管理', path: '/system/menu', icon: h(MenuOutlined) },
  { title: '部门管理', path: '/system/dept', icon: h(ApartmentOutlined) },
];

onMounted(() => {
  // 模拟数据
  stats.value = {
    userCount: 10,
    roleCount: 5,
    menuCount: 20,
    deptCount: 8,
  };
});
</script>

<style lang="less" scoped>
.dashboard {
  .welcome-card {
    margin-bottom: 16px;

    .welcome-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .welcome-text {
        h2 {
          margin: 0 0 8px;
          font-size: 20px;
        }

        p {
          margin: 0;
          color: #999;
        }
      }
    }
  }

  .stat-row {
    margin-bottom: 16px;
  }

  .quick-entry {
    margin-bottom: 16px;

    .entry-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      cursor: pointer;
      border-radius: 8px;
      transition: background-color 0.3s;

      &:hover {
        background-color: #f5f5f5;
      }

      .entry-icon {
        font-size: 32px;
        color: #1890ff;
        margin-bottom: 8px;
      }
    }
  }

  .system-info {
    margin-bottom: 16px;
  }
}
</style>
