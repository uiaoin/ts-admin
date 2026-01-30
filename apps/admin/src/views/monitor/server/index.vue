<template>
  <div class="server-monitor">
    <a-spin :spinning="loading">
      <a-row :gutter="16">
        <!-- 服务器信息 -->
        <a-col :span="12">
          <a-card title="服务器信息" :bordered="false">
            <template #extra>
              <a-button type="link" size="small" @click="fetchData">
                <ReloadOutlined /> 刷新
              </a-button>
            </template>
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="主机名">{{ serverInfo?.server.hostname || '-' }}</a-descriptions-item>
              <a-descriptions-item label="操作系统">{{ serverInfo?.server.platform || '-' }}</a-descriptions-item>
              <a-descriptions-item label="系统架构">{{ serverInfo?.server.arch || '-' }}</a-descriptions-item>
              <a-descriptions-item label="系统版本">{{ serverInfo?.server.release || '-' }}</a-descriptions-item>
              <a-descriptions-item label="运行时间">{{ serverInfo?.server.uptime || '-' }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>

        <!-- CPU信息 -->
        <a-col :span="12">
          <a-card title="CPU信息" :bordered="false">
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="型号">{{ serverInfo?.cpu.model || '-' }}</a-descriptions-item>
              <a-descriptions-item label="核心数">{{ serverInfo?.cpu.cores || '-' }} 核</a-descriptions-item>
              <a-descriptions-item label="使用率">
                <a-progress 
                  :percent="serverInfo?.cpu.usage || 0" 
                  :stroke-color="getProgressColor(serverInfo?.cpu.usage || 0)"
                  size="small"
                />
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
      </a-row>

      <a-row :gutter="16" style="margin-top: 16px">
        <!-- 内存信息 -->
        <a-col :span="12">
          <a-card title="内存信息" :bordered="false">
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="总内存">{{ serverInfo?.memory.total || '-' }}</a-descriptions-item>
              <a-descriptions-item label="已使用">{{ serverInfo?.memory.used || '-' }}</a-descriptions-item>
              <a-descriptions-item label="剩余">{{ serverInfo?.memory.free || '-' }}</a-descriptions-item>
              <a-descriptions-item label="使用率">
                <a-progress 
                  :percent="serverInfo?.memory.usage || 0" 
                  :stroke-color="getProgressColor(serverInfo?.memory.usage || 0)"
                  size="small"
                />
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>

        <!-- Node.js信息 -->
        <a-col :span="12">
          <a-card title="Node.js信息" :bordered="false">
            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="版本">{{ serverInfo?.node.version || '-' }}</a-descriptions-item>
              <a-descriptions-item label="进程ID">{{ serverInfo?.node.pid || '-' }}</a-descriptions-item>
              <a-descriptions-item label="运行时间">{{ serverInfo?.node.uptime || '-' }}</a-descriptions-item>
              <a-descriptions-item label="RSS内存">{{ serverInfo?.node.memoryUsage?.rss || '-' }}</a-descriptions-item>
              <a-descriptions-item label="堆总内存">{{ serverInfo?.node.memoryUsage?.heapTotal || '-' }}</a-descriptions-item>
              <a-descriptions-item label="堆已使用">{{ serverInfo?.node.memoryUsage?.heapUsed || '-' }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ReloadOutlined } from '@ant-design/icons-vue';
import { getServerInfo, type ServerInfo } from '@/api/monitor';

const loading = ref(false);
const serverInfo = ref<ServerInfo | null>(null);
let timer: number | null = null;

function getProgressColor(percent: number): string {
  if (percent >= 90) return '#ff4d4f';
  if (percent >= 70) return '#faad14';
  return '#52c41a';
}

async function fetchData() {
  loading.value = true;
  try {
    serverInfo.value = await getServerInfo();
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchData();
  // 每10秒刷新一次
  timer = window.setInterval(fetchData, 10000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style lang="less" scoped>
.server-monitor {
  .ant-card {
    margin-bottom: 0;
  }
}
</style>
