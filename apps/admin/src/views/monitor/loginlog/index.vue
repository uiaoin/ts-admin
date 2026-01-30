<template>
  <div class="page-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="queryParams">
        <a-form-item label="用户名称">
          <a-input v-model:value="queryParams.username" placeholder="请输入用户名称" allow-clear style="width: 150px" />
        </a-form-item>
        <a-form-item label="登录IP">
          <a-input v-model:value="queryParams.ip" placeholder="请输入登录IP" allow-clear style="width: 150px" />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="queryParams.status" placeholder="请选择" allow-clear style="width: 100px">
            <a-select-option :value="1">成功</a-select-option>
            <a-select-option :value="0">失败</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="登录时间">
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
        <a-popconfirm title="确定要清空所有登录日志吗？" @confirm="handleClear">
          <a-button danger v-permission="'monitor:loginlog:delete'">
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
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 1 ? 'success' : 'error'">
            {{ record.status === 1 ? '成功' : '失败' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <a-popconfirm title="确定要删除吗？" @confirm="handleDelete(record.id)">
            <a-button type="link" size="small" danger v-permission="'monitor:loginlog:delete'">
              删除
            </a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import type { Dayjs } from 'dayjs';
import { SearchOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { getLoginLogList, deleteLoginLog, clearLoginLogs, type LoginLogInfo } from '@/api/log';

// 查询参数
const queryParams = reactive({
  username: '',
  ip: '',
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
const tableData = ref<LoginLogInfo[]>([]);
const loading = ref(false);

// 表格列
const columns = [
  { title: '日志编号', dataIndex: 'id', key: 'id', width: 90 },
  { title: '用户名称', dataIndex: 'username', key: 'username', width: 120 },
  { title: '登录IP', dataIndex: 'ip', key: 'ip', width: 140 },
  { title: '登录地点', dataIndex: 'location', key: 'location', width: 150 },
  { title: '浏览器', dataIndex: 'browser', key: 'browser', width: 120 },
  { title: '操作系统', dataIndex: 'os', key: 'os', width: 150 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '提示信息', dataIndex: 'msg', key: 'msg', ellipsis: true },
  { title: '登录时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 80, fixed: 'right' },
];

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

    const { list, total } = await getLoginLogList(params);
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
  queryParams.username = '';
  queryParams.ip = '';
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

// 删除
async function handleDelete(id: number) {
  try {
    await deleteLoginLog(id);
    message.success('删除成功');
    fetchData();
  } catch (error) {
    console.error(error);
  }
}

// 清空
async function handleClear() {
  try {
    await clearLoginLogs();
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
</style>
