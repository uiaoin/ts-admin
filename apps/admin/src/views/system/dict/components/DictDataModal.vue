<template>
  <a-modal
    v-model:open="visible"
    :title="`字典数据 - ${dictType}`"
    width="800px"
    :footer="null"
  >
    <!-- 操作按钮 -->
    <div class="table-toolbar">
      <a-button type="primary" @click="handleAdd">
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
      size="small"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'isDefault'">
          <a-tag :color="record.isDefault === 1 ? 'success' : 'default'">
            {{ record.isDefault === 1 ? '是' : '否' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 1 ? 'success' : 'error'">
            {{ record.status === 1 ? '正常' : '禁用' }}
          </a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            <a-popconfirm title="确定要删除吗？" @confirm="handleDelete(record.id)">
              <a-button type="link" size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 编辑弹窗 -->
    <DictDataFormModal
      v-model:open="formModalVisible"
      :dict-type="dictType"
      :dict-data-id="currentDataId"
      @success="fetchData"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { getDictDataList, deleteDictData } from '@/api/dict';
import DictDataFormModal from './DictDataFormModal.vue';

const props = defineProps<{
  open: boolean;
  dictType: string;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
}>();

const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
});

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
});

// 表格数据
const tableData = ref<any[]>([]);
const loading = ref(false);

// 弹窗
const formModalVisible = ref(false);
const currentDataId = ref<number | undefined>();

// 表格列
const columns = [
  { title: '字典标签', dataIndex: 'label', key: 'label' },
  { title: '字典值', dataIndex: 'value', key: 'value' },
  { title: '排序', dataIndex: 'sort', key: 'sort', width: 60 },
  { title: '默认', dataIndex: 'isDefault', key: 'isDefault', width: 60 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 60 },
  { title: '操作', key: 'action', width: 120 },
];

// 监听弹窗打开
watch(
  () => props.open,
  (val) => {
    if (val && props.dictType) {
      pagination.current = 1;
      fetchData();
    }
  },
);

// 获取数据
async function fetchData() {
  loading.value = true;
  try {
    const { list, total } = await getDictDataList({
      page: pagination.current,
      pageSize: pagination.pageSize,
      dictType: props.dictType,
    });
    tableData.value = list;
    pagination.total = total;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
}

// 表格变化
function handleTableChange(pag: any) {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchData();
}

// 新增
function handleAdd() {
  currentDataId.value = undefined;
  formModalVisible.value = true;
}

// 编辑
function handleEdit(record: any) {
  currentDataId.value = record.id;
  formModalVisible.value = true;
}

// 删除
async function handleDelete(id: number) {
  try {
    await deleteDictData(id);
    message.success('删除成功');
    fetchData();
  } catch (error) {
    console.error(error);
  }
}
</script>

<style lang="less" scoped>
.table-toolbar {
  margin-bottom: 16px;
}
</style>
