<template>
  <div class="page-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="queryParams">
        <a-form-item label="角色名称">
          <a-input v-model:value="queryParams.name" placeholder="请输入角色名称" allow-clear />
        </a-form-item>
        <a-form-item label="角色编码">
          <a-input v-model:value="queryParams.code" placeholder="请输入角色编码" allow-clear />
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
      <a-button type="primary" v-permission="'system:role:add'" @click="handleAdd">
        <PlusOutlined /> 新增
      </a-button>
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
          <a-switch
            :checked="record.status === 1"
            :disabled="record.code === 'admin'"
            @change="(checked: boolean) => handleStatusChange(record, checked)"
            v-permission="'system:role:edit'"
          />
        </template>
        <template v-if="column.key === 'dataScope'">
          {{ dataScopeText[record.dataScope] || '未知' }}
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" v-permission="'system:role:edit'" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-popconfirm
              title="确定要删除吗？"
              :disabled="record.code === 'admin'"
              @confirm="handleDelete(record.id)"
            >
              <a-button
                type="link"
                size="small"
                danger
                v-permission="'system:role:delete'"
                :disabled="record.code === 'admin'"
              >
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 编辑弹窗 -->
    <RoleFormModal
      v-model:open="modalVisible"
      :role-id="currentRoleId"
      @success="fetchData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { getRoleList, deleteRole, updateRoleStatus } from '@/api/role';
import RoleFormModal from './components/RoleFormModal.vue';

const dataScopeText: Record<number, string> = {
  1: '全部数据',
  2: '本部门及以下',
  3: '本部门',
  4: '仅本人',
  5: '自定义',
};

// 查询参数
const queryParams = reactive({
  name: '',
  code: '',
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
const modalVisible = ref(false);
const currentRoleId = ref<number | undefined>();

// 表格列
const columns = [
  { title: '角色名称', dataIndex: 'name', key: 'name' },
  { title: '角色编码', dataIndex: 'code', key: 'code' },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '数据权限', dataIndex: 'dataScope', key: 'dataScope', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 150, fixed: 'right' },
];

// 获取数据
async function fetchData() {
  loading.value = true;
  try {
    const { list, total } = await getRoleList({
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
  queryParams.code = '';
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
  currentRoleId.value = undefined;
  modalVisible.value = true;
}

// 编辑
function handleEdit(record: any) {
  currentRoleId.value = record.id;
  modalVisible.value = true;
}

// 删除
async function handleDelete(id: number) {
  try {
    await deleteRole(id);
    message.success('删除成功');
    fetchData();
  } catch (error) {
    console.error(error);
  }
}

// 状态变化
async function handleStatusChange(record: any, checked: boolean) {
  try {
    await updateRoleStatus(record.id, checked ? 1 : 0);
    message.success('状态更新成功');
    record.status = checked ? 1 : 0;
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
