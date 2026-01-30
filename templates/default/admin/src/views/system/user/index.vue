<template>
  <div class="page-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="queryParams">
        <a-form-item label="用户名">
          <a-input v-model:value="queryParams.username" placeholder="请输入用户名" allow-clear />
        </a-form-item>
        <a-form-item label="手机号">
          <a-input v-model:value="queryParams.phone" placeholder="请输入手机号" allow-clear />
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
        <a-button type="primary" v-permission="'system:user:add'" @click="handleAdd">
          <PlusOutlined /> 新增
        </a-button>
        <a-button danger v-permission="'system:user:delete'" :disabled="selectedRowKeys.length === 0" @click="handleBatchDelete">
          <DeleteOutlined /> 批量删除
        </a-button>
      </a-space>
    </div>

    <!-- 数据表格 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="pagination"
      :row-selection="{ selectedRowKeys, onChange: onSelectChange }"
      row-key="id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-switch
            :checked="record.status === 1"
            @change="(checked: boolean) => handleStatusChange(record, checked)"
            v-permission="'system:user:edit'"
          />
        </template>
        <template v-if="column.key === 'gender'">
          {{ record.gender === 1 ? '男' : record.gender === 2 ? '女' : '未知' }}
        </template>
        <template v-if="column.key === 'roles'">
          <a-tag v-for="role in record.roles" :key="role.id" color="blue">
            {{ role.name }}
          </a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" v-permission="'system:user:edit'" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-button type="link" size="small" v-permission="'system:user:resetPwd'" @click="handleResetPwd(record)">
              重置密码
            </a-button>
            <a-popconfirm title="确定要删除吗？" @confirm="handleDelete(record.id)">
              <a-button type="link" size="small" danger v-permission="'system:user:delete'">
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 编辑弹窗 -->
    <UserFormModal
      v-model:open="modalVisible"
      :user-id="currentUserId"
      @success="fetchData"
    />

    <!-- 重置密码弹窗 -->
    <ResetPasswordModal
      v-model:open="resetPwdVisible"
      :user-id="currentUserId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons-vue';
import { getUserList, deleteUser, batchDeleteUser, updateUserStatus } from '@/api/user';
import UserFormModal from './components/UserFormModal.vue';
import ResetPasswordModal from './components/ResetPasswordModal.vue';

// 查询参数
const queryParams = reactive({
  username: '',
  phone: '',
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
const selectedRowKeys = ref<number[]>([]);

// 弹窗
const modalVisible = ref(false);
const resetPwdVisible = ref(false);
const currentUserId = ref<number | undefined>();

// 表格列
const columns = [
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
  { title: '手机号', dataIndex: 'phone', key: 'phone' },
  { title: '性别', dataIndex: 'gender', key: 'gender', width: 80 },
  { title: '角色', dataIndex: 'roles', key: 'roles' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' },
];

// 获取数据
async function fetchData() {
  loading.value = true;
  try {
    const { list, total } = await getUserList({
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
  queryParams.username = '';
  queryParams.phone = '';
  queryParams.status = undefined;
  handleSearch();
}

// 表格变化
function handleTableChange(pag: any) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchData();
}

// 选择变化
function onSelectChange(keys: number[]) {
  selectedRowKeys.value = keys;
}

// 新增
function handleAdd() {
  currentUserId.value = undefined;
  modalVisible.value = true;
}

// 编辑
function handleEdit(record: any) {
  currentUserId.value = record.id;
  modalVisible.value = true;
}

// 删除
async function handleDelete(id: number) {
  try {
    await deleteUser(id);
    message.success('删除成功');
    fetchData();
  } catch (error) {
    console.error(error);
  }
}

// 批量删除
function handleBatchDelete() {
  Modal.confirm({
    title: '提示',
    content: `确定要删除选中的 ${selectedRowKeys.value.length} 条数据吗？`,
    async onOk() {
      await batchDeleteUser(selectedRowKeys.value);
      message.success('删除成功');
      selectedRowKeys.value = [];
      fetchData();
    },
  });
}

// 重置密码
function handleResetPwd(record: any) {
  currentUserId.value = record.id;
  resetPwdVisible.value = true;
}

// 状态变化
async function handleStatusChange(record: any, checked: boolean) {
  try {
    await updateUserStatus(record.id, checked ? 1 : 0);
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
