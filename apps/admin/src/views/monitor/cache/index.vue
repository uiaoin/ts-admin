<template>
  <div class="cache-monitor">
    <a-row :gutter="16">
      <!-- 缓存信息 -->
      <a-col :span="24">
        <a-card title="Redis信息" :bordered="false">
          <template #extra>
            <a-space>
              <a-button type="link" size="small" @click="fetchCacheInfo">
                <ReloadOutlined /> 刷新
              </a-button>
            </a-space>
          </template>
          <a-spin :spinning="infoLoading">
            <a-row :gutter="24">
              <a-col :span="6">
                <a-statistic title="Redis版本" :value="cacheInfo?.version || '-'" />
              </a-col>
              <a-col :span="6">
                <a-statistic title="运行模式" :value="cacheInfo?.mode || '-'" />
              </a-col>
              <a-col :span="6">
                <a-statistic title="端口" :value="cacheInfo?.port || '-'" />
              </a-col>
              <a-col :span="6">
                <a-statistic title="运行时间" :value="cacheInfo?.uptime || '-'" />
              </a-col>
            </a-row>
            <a-divider />
            <a-row :gutter="24">
              <a-col :span="6">
                <a-statistic title="客户端连接数" :value="cacheInfo?.connectedClients || '0'" />
              </a-col>
              <a-col :span="6">
                <a-statistic title="已用内存" :value="cacheInfo?.usedMemory || '0'" />
              </a-col>
              <a-col :span="6">
                <a-statistic title="内存峰值" :value="cacheInfo?.usedMemoryPeak || '0'" />
              </a-col>
              <a-col :span="6">
                <a-statistic title="命中率" :value="cacheInfo?.hitRate || '0%'" />
              </a-col>
            </a-row>
            <a-divider />
            <a-row :gutter="24">
              <a-col :span="8">
                <a-statistic title="Key总数" :value="cacheInfo?.totalKeys || 0" />
              </a-col>
              <a-col :span="8">
                <a-statistic title="总命令数" :value="cacheInfo?.commandStats?.totalCommands || '0'" />
              </a-col>
              <a-col :span="8">
                <a-statistic title="每秒执行命令数" :value="cacheInfo?.commandStats?.instantaneousOps || '0'" suffix="ops/s" />
              </a-col>
            </a-row>
          </a-spin>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="16" style="margin-top: 16px">
      <!-- 缓存键列表 -->
      <a-col :span="24">
        <a-card title="缓存键列表" :bordered="false">
          <template #extra>
            <a-space>
              <a-input-search
                v-model:value="searchPattern"
                placeholder="搜索键名（支持*通配符）"
                style="width: 250px"
                @search="fetchCacheKeys"
              />
              <a-popconfirm title="确定要清空所有缓存吗？" @confirm="handleClearAll">
                <a-button danger v-permission="'monitor:cache:delete'">
                  <DeleteOutlined /> 清空全部
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
          <a-table
            :columns="columns"
            :data-source="cacheKeys"
            :loading="keysLoading"
            :pagination="false"
            row-key="key"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'type'">
                <a-tag :color="typeColor[record.type] || 'default'">{{ record.type }}</a-tag>
              </template>
              <template v-if="column.key === 'ttl'">
                {{ record.ttl === -1 ? '永久' : record.ttl === -2 ? '已过期' : `${record.ttl}秒` }}
              </template>
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" size="small" @click="handleView(record.key)">
                    查看
                  </a-button>
                  <a-popconfirm title="确定要删除吗？" @confirm="handleDelete(record.key)">
                    <a-button type="link" size="small" danger v-permission="'monitor:cache:delete'">
                      删除
                    </a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </template>
          </a-table>
          <div class="keys-footer">
            <span>共 {{ totalKeys }} 个键</span>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 查看缓存值弹窗 -->
    <a-modal
      v-model:open="valueModalVisible"
      title="缓存值"
      width="700px"
      :footer="null"
    >
      <a-spin :spinning="valueLoading">
        <a-descriptions :column="1" bordered size="small" v-if="cacheValue">
          <a-descriptions-item label="键名">{{ cacheValue.key }}</a-descriptions-item>
          <a-descriptions-item label="类型">
            <a-tag :color="typeColor[cacheValue.type]">{{ cacheValue.type }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="过期时间">
            {{ cacheValue.ttl === -1 ? '永久' : cacheValue.ttl === -2 ? '已过期' : `${cacheValue.ttl}秒` }}
          </a-descriptions-item>
          <a-descriptions-item label="值">
            <div class="value-content">
              <pre>{{ formatValue(cacheValue.value) }}</pre>
            </div>
          </a-descriptions-item>
        </a-descriptions>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { ReloadOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import {
  getCacheInfo,
  getCacheKeys,
  getCacheValue,
  deleteCache,
  clearCache,
  type CacheInfo,
  type CacheKey,
  type CacheValue,
} from '@/api/monitor';

const typeColor: Record<string, string> = {
  string: 'green',
  list: 'blue',
  set: 'purple',
  zset: 'orange',
  hash: 'cyan',
};

// 缓存信息
const cacheInfo = ref<CacheInfo | null>(null);
const infoLoading = ref(false);

// 缓存键列表
const cacheKeys = ref<CacheKey[]>([]);
const keysLoading = ref(false);
const searchPattern = ref('*');
const totalKeys = ref(0);

// 缓存值
const valueModalVisible = ref(false);
const valueLoading = ref(false);
const cacheValue = ref<CacheValue | null>(null);

const columns = [
  { title: '键名', dataIndex: 'key', key: 'key', ellipsis: true },
  { title: '类型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '过期时间', dataIndex: 'ttl', key: 'ttl', width: 120 },
  { title: '操作', key: 'action', width: 150 },
];

// 获取缓存信息
async function fetchCacheInfo() {
  infoLoading.value = true;
  try {
    cacheInfo.value = await getCacheInfo();
  } catch (error) {
    console.error(error);
  } finally {
    infoLoading.value = false;
  }
}

// 获取缓存键列表
async function fetchCacheKeys() {
  keysLoading.value = true;
  try {
    const { total, list } = await getCacheKeys(searchPattern.value || '*', 200);
    cacheKeys.value = list;
    totalKeys.value = total;
  } catch (error) {
    console.error(error);
  } finally {
    keysLoading.value = false;
  }
}

// 查看缓存值
async function handleView(key: string) {
  valueModalVisible.value = true;
  valueLoading.value = true;
  try {
    cacheValue.value = await getCacheValue(key);
  } catch (error) {
    console.error(error);
  } finally {
    valueLoading.value = false;
  }
}

// 格式化值
function formatValue(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'string') {
    try {
      const obj = JSON.parse(value);
      return JSON.stringify(obj, null, 2);
    } catch {
      return value;
    }
  }
  return JSON.stringify(value, null, 2);
}

// 删除缓存
async function handleDelete(key: string) {
  try {
    await deleteCache(key);
    message.success('删除成功');
    fetchCacheKeys();
    fetchCacheInfo();
  } catch (error) {
    console.error(error);
  }
}

// 清空所有缓存
async function handleClearAll() {
  try {
    await clearCache();
    message.success('清空成功');
    fetchCacheKeys();
    fetchCacheInfo();
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  fetchCacheInfo();
  fetchCacheKeys();
});
</script>

<style lang="less" scoped>
.cache-monitor {
  .keys-footer {
    margin-top: 16px;
    text-align: right;
    color: #999;
  }

  .value-content {
    max-height: 400px;
    overflow: auto;
    background: #f5f5f5;
    padding: 12px;
    border-radius: 4px;

    pre {
      margin: 0;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}
</style>
