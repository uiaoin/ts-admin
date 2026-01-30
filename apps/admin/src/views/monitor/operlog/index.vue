<template>
  <div class="page-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="queryParams">
        <a-form-item label="系统模块">
          <a-input v-model:value="queryParams.module" placeholder="请输入系统模块" allow-clear style="width: 150px" />
        </a-form-item>
        <a-form-item label="操作人员">
          <a-input v-model:value="queryParams.username" placeholder="请输入操作人员" allow-clear style="width: 150px" />
        </a-form-item>
        <a-form-item label="操作类型">
          <a-select v-model:value="queryParams.type" placeholder="请选择" allow-clear style="width: 120px">
            <a-select-option value="CREATE">新增</a-select-option>
            <a-select-option value="UPDATE">修改</a-select-option>
            <a-select-option value="DELETE">删除</a-select-option>
            <a-select-option value="QUERY">查询</a-select-option>
            <a-select-option value="EXPORT">导出</a-select-option>
            <a-select-option value="IMPORT">导入</a-select-option>
            <a-select-option value="OTHER">其他</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="queryParams.status" placeholder="请选择" allow-clear style="width: 100px">
            <a-select-option :value="1">成功</a-select-option>
            <a-select-option :value="0">失败</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="操作时间">
          <a-range-picker
            v-model:value="dateRange"
            :show-time="{ format: 'HH:mm:ss' }"
            format="YYYY-MM-DD HH:mm:ss"
            :placeholder="['开始时间', '结束时间']"
            style="width: 380px"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <SearchOutlined /> 搜索
            </a-button>
            <a-button @click="handleReset">
              <ReloadOutlined /> 重置
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 操作按钮 -->
    <div class="table-toolbar">
      <a-space>
        <a-popconfirm title="确定要清空所有操作日志吗？" @confirm="handleClear">
          <a-button danger v-permission="'monitor:operlog:delete'">
            <DeleteOutlined /> 清空
          </a-button>
        </a-popconfirm>
      </a-space>
    </div>

    <!-- 数据表格 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="pagination"
      row-key="id"
      :scroll="{ x: 1500 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'type'">
          <a-tag :color="typeColor[record.type] || 'default'">
            {{ typeText[record.type] || record.type }}
          </a-tag>
        </template>
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 1 ? 'success' : 'error'">
            {{ record.status === 1 ? '成功' : '失败' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'duration'">
          <span :style="{ color: record.duration > 1000 ? '#ff4d4f' : record.duration > 500 ? '#faad14' : '#52c41a' }">
            {{ record.duration }}ms
          </span>
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleDetail(record)">
              详情
            </a-button>
            <a-popconfirm title="确定要删除吗？" @confirm="handleDelete(record.id)">
              <a-button type="link" size="small" danger v-permission="'monitor:operlog:delete'">
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="操作日志详情"
      width="700px"
      :footer="null"
    >
      <a-descriptions :column="2" bordered size="small" v-if="currentRecord">
        <a-descriptions-item label="日志编号">{{ currentRecord.id }}</a-descriptions-item>
        <a-descriptions-item label="操作模块">{{ currentRecord.module }}</a-descriptions-item>
        <a-descriptions-item label="操作类型">
          <a-tag :color="typeColor[currentRecord.type]">{{ typeText[currentRecord.type] }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="请求方式">
          <a-tag>{{ currentRecord.requestMethod }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="操作人员">{{ currentRecord.username }}</a-descriptions-item>
        <a-descriptions-item label="操作状态">
          <a-tag :color="currentRecord.status === 1 ? 'success' : 'error'">
            {{ currentRecord.status === 1 ? '成功' : '失败' }}
          </a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="操作IP">{{ currentRecord.ip || '-' }}</a-descriptions-item>
        <a-descriptions-item label="操作地点">{{ currentRecord.location || '-' }}</a-descriptions-item>
        <a-descriptions-item label="请求地址" :span="2">{{ currentRecord.url }}</a-descriptions-item>
        <a-descriptions-item label="操作方法" :span="2">{{ currentRecord.method }}</a-descriptions-item>
        <a-descriptions-item label="请求耗时">{{ currentRecord.duration }}ms</a-descriptions-item>
        <a-descriptions-item label="操作时间">{{ currentRecord.createdAt }}</a-descriptions-item>
        <a-descriptions-item label="请求参数" :span="2">
          <div class="json-content">{{ formatJson(currentRecord.param) }}</div>
        </a-descriptions-item>
        <a-descriptions-item label="返回结果" :span="2" v-if="currentRecord.status === 1">
          <div class="json-content">{{ formatJson(currentRecord.result) }}</div>
        </a-descriptions-item>
        <a-descriptions-item label="错误信息" :span="2" v-if="currentRecord.status === 0">
          <div class="error-content">{{ currentRecord.errorMsg }}</div>
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import { SearchOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { getOperLogList, deleteOperLog, clearOperLogs, type OperLogInfo } from '@/api/log';

const typeText: Record<string, string> = {
  CREATE: '新增',
  UPDATE: '修改',
  DELETE: '删除',
  QUERY: '查询',
  EXPORT: '导出',
  IMPORT: '导入',
  OTHER: '其他',
};

const typeColor: Record<string, string> = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
  QUERY: 'cyan',
  EXPORT: 'purple',
  IMPORT: 'orange',
  OTHER: 'default',
};

// 查询参数
const queryParams = reactive({
  module: '',
  username: '',
  type: undefined as string | undefined,
  status: undefined as number | undefined,
});

const dateRange = ref<[Dayjs, Dayjs] | null>(null);

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`,
});

// 表格数据
const tableData = ref<OperLogInfo[]>([]);
const loading = ref(false);

// 详情弹窗
const detailVisible = ref(false);
const currentRecord = ref<OperLogInfo | null>(null);

// 表格列
const columns = [
  { title: '日志编号', dataIndex: 'id', key: 'id', width: 90 },
  { title: '系统模块', dataIndex: 'module', key: 'module', width: 120 },
  { title: '操作类型', dataIndex: 'type', key: 'type', width: 90 },
  { title: '请求方式', dataIndex: 'requestMethod', key: 'requestMethod', width: 90 },
  { title: '操作人员', dataIndex: 'username', key: 'username', width: 100 },
  { title: '操作IP', dataIndex: 'ip', key: 'ip', width: 130 },
  { title: '操作地点', dataIndex: 'location', key: 'location', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '耗时', dataIndex: 'duration', key: 'duration', width: 80 },
  { title: '操作时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 120, fixed: 'right' },
];

// 格式化JSON
function formatJson(jsonStr: string | null): string {
  if (!jsonStr) return '-';
  try {
    const obj = JSON.parse(jsonStr);
    return JSON.stringify(obj, null, 2);
  } catch {
    return jsonStr;
  }
}

// 获取数据
async function fetchData() {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...queryParams,
    };

    if (dateRange.value) {
      params.startTime = dateRange.value[0].format('YYYY-MM-DD HH:mm:ss');
      params.endTime = dateRange.value[1].format('YYYY-MM-DD HH:mm:ss');
    }

    const { list, total } = await getOperLogList(params);
    tableData.value = list;
    pagination.total = total;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

// 搜索
function handleSearch() {
  pagination.current = 1;
  fetchData();
}

// 重置
function handleReset() {
  queryParams.module = '';
  queryParams.username = '';
  queryParams.type = undefined;
  queryParams.status = undefined;
  dateRange.value = null;
  handleSearch();
}

// 表格变化
function handleTableChange(pag: any) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchData();
}

// 查看详情
function handleDetail(record: OperLogInfo) {
  currentRecord.value = record;
  detailVisible.value = true;
}

// 删除
async function handleDelete(id: number) {
  try {
    await deleteOperLog(id);
    message.success('删除成功');
    fetchData();
  } catch (error) {
    console.error(error);
  }
}

// 清空
async function handleClear() {
  try {
    await clearOperLogs();
    message.success('清空成功');
    fetchData();
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  fetchData();
});
</script>

<style lang="less" scoped>
.table-toolbar {
  margin-bottom: 16px;
}

.json-content {
  max-height: 200px;
  overflow: auto;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-content {
  color: #ff4d4f;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
