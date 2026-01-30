<template>
  <div class="page-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline" :model="queryParams">
        <a-form-item label="部门名称">
          <a-input v-model:value="queryParams.name" placeholder="请输入部门名称" allow-clear />
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
        <a-button type="primary" v-permission="'system:dept:add'" @click="handleAdd()">
          <PlusOutlined /> 新增
        </a-button>
        <a-button @click="toggleExpand">
          {{ expandAll ? '全部折叠' : '全部展开' }}
        </a-button>
      </a-space>
    </div>

    <!-- 数据表格 -->
    <a-table
      :columns="columns"
      :data-source="tableData"
      :loading="loading"
      :pagination="false"
      :expanded-row-keys="expandedRowKeys"
      row-key="id"
      @expand="handleExpand"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 1 ? 'success' : 'error'">
            {{ record.status === 1 ? '正常' : '禁用' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" v-permission="'system:dept:add'" @click="handleAdd(record.id)">
              新增
            </a-button>
            <a-button type="link" size="small" v-permission="'system:dept:edit'" @click="handleEdit(record)">
              编辑
            </a-button>
            <a-popconfirm title="确定要删除吗？" @confirm="handleDelete(record.id)">
              <a-button type="link" size="small" danger v-permission="'system:dept:delete'">
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 编辑弹窗 -->
    <DeptFormModal
      v-model:open="modalVisible"
      :dept-id="currentDeptId"
      :parent-id="currentParentId"
      @success="fetchData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { SearchOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons-vue';
import { getDeptList, deleteDept } from '@/api/dept';
import DeptFormModal from './components/DeptFormModal.vue';

// 查询参数
const queryParams = reactive({
  name: '',
  status: undefined as number | undefined,
});

// 表格数据
const tableData = ref<any[]>([]);
const loading = ref(false);

// 展开控制
const expandAll = ref(true);
const expandedRowKeys = ref<number[]>([]);

// 弹窗
const modalVisible = ref(false);
const currentDeptId = ref<number | undefined>();
const currentParentId = ref<number | undefined>();

// 表格列
const columns = [
  { title: '部门名称', dataIndex: 'name', key: 'name', width: 200 },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 80 },
  { title: '负责人', dataIndex: 'leader', key: 'leader', width: 120 },
  { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 150 },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '状态', dataIndex: 'status', key: 'status', width: 80 },
  { title: '操作', key: 'action', width: 180, fixed: 'right' },
];

// 获取所有ID
function getAllIds(data: any[]): number[] {
  const ids: number[] = [];
  function traverse(list: any[]) {
    list.forEach((item) => {
      ids.push(item.id);
      if (item.children && item.children.length > 0) {
        traverse(item.children);
      }
    });
  }
  traverse(data);
  return ids;
}

// 获取数据
async function fetchData() {
  loading.value = true;
  try {
    const list = await getDeptList(queryParams);
    tableData.value = list;
    if (expandAll.value) {
      expandedRowKeys.value = getAllIds(list);
    }
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

// 搜索
function handleSearch() {
  fetchData();
}

// 重置
function handleReset() {
  queryParams.name = '';
  queryParams.status = undefined;
  fetchData();
}

// 展开/折叠
function toggleExpand() {
  expandAll.value = !expandAll.value;
  if (expandAll.value) {
    expandedRowKeys.value = getAllIds(tableData.value);
  } else {
    expandedRowKeys.value = [];
  }
}

// 行展开事件
function handleExpand(expanded: boolean, record: any) {
  if (expanded) {
    expandedRowKeys.value.push(record.id);
  } else {
    const index = expandedRowKeys.value.indexOf(record.id);
    if (index > -1) {
      expandedRowKeys.value.splice(index, 1);
    }
  }
}

// 新增
function handleAdd(parentId?: number) {
  currentDeptId.value = undefined;
  currentParentId.value = parentId;
  modalVisible.value = true;
}

// 编辑
function handleEdit(record: any) {
  currentDeptId.value = record.id;
  currentParentId.value = undefined;
  modalVisible.value = true;
}

// 删除
async function handleDelete(id: number) {
  try {
    await deleteDept(id);
    message.success('删除成功');
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
