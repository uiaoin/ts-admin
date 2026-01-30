<template>
  <div class="page-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="queryParams">
        <a-form-item label="字典名称">
          <a-input v-model:value="queryParams.name" placeholder="请输入字典名称" allow-clear />
        </a-form-item>
        <a-form-item label="字典类型">
          <a-input v-model:value="queryParams.type" placeholder="请输入字典类型" allow-clear />
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-model:value="queryParams.status" placeholder="请选择" allow-clear style="width: 120px">
            <a-select-option :value="1">正常</a-select-option>
            <a-select-option :value="0">禁用</a-select-option>
          </a-select>
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
        <a-button type="primary" v-permission="'system:dict:add'" @click="handleAdd">
          <PlusOutlined /> 新增
        </a-button>
        <a-button v-permission="'system:dict:edit'" @click="handleRefreshCache">
          <SyncOutlined /> 刷新缓存
        </a-button>
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
        <template v-if="column.key === 'type'">
          <a @click="handleViewData(record)">{{ record.type }}</a>
        </template>
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 1 ? 'success' : 'error'">
            {{ record.status === 1 ? '正常' : '禁用' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" v-permission="'system:dict:edit'" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-popconfirm title="确定要删除吗？" @confirm="handleDelete(record.id)">
              <a-button type="link" size="small" danger v-permission="'system:dict:delete'">
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 编辑弹窗 -->
    <DictTypeFormModal
      v-model:open="typeModalVisible"
      :dict-type-id="currentTypeId"
      @success="fetchData"
    />

    <!-- 字典数据弹窗 -->
    <DictDataModal
      v-model:open="dataModalVisible"
      :dict-type="currentDictType"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { SearchOutlined, ReloadOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons-vue';
import { getDictTypeList, deleteDictType, refreshDictCache } from '@/api/dict';
import DictTypeFormModal from './components/DictTypeFormModal.vue';
import DictDataModal from './components/DictDataModal.vue';

// 查询参数
const queryParams = reactive({
  name: '',
  type: '',
  status: undefined as number | undefined,
});

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
const tableData = ref<any[]>([]);
const loading = ref(false);

// 弹窗
const typeModalVisible = ref(false);
const dataModalVisible = ref(false);
const currentTypeId = ref<number | undefined>();
const currentDictType = ref('');

// 表格列
const columns = [
  { title: '字典名称', dataIndex: 'name', key: 'name' },
  { title: '字典类型', dataIndex: 'type', key: 'type' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '备注', dataIndex: 'remark', key: 'remark' },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' },
];

// 获取数据
async function fetchData() {
  loading.value = true;
  try {
    const { list, total } = await getDictTypeList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...queryParams,
    });
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
  queryParams.name = '';
  queryParams.type = '';
  queryParams.status = undefined;
  handleSearch();
}

// 表格变化
function handleTableChange(pag: any) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchData();
}

// 新增
function handleAdd() {
  currentTypeId.value = undefined;
  typeModalVisible.value = true;
}

// 编辑
function handleEdit(record: any) {
  currentTypeId.value = record.id;
  typeModalVisible.value = true;
}

// 删除
async function handleDelete(id: number) {
  try {
    await deleteDictType(id);
    message.success('删除成功');
    fetchData();
  } catch (error) {
    console.error(error);
  }
}

// 查看字典数据
function handleViewData(record: any) {
  currentDictType.value = record.type;
  dataModalVisible.value = true;
}

// 刷新缓存
async function handleRefreshCache() {
  try {
    await refreshDictCache();
    message.success('刷新成功');
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
