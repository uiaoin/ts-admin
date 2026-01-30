<template>
  <a-modal
    v-model:open="visible"
    :title="isEdit ? '编辑部门' : '新增部门'"
    :confirm-loading="loading"
    width="550px"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 17 }"
    >
      <a-form-item label="上级部门" name="parentId">
        <a-tree-select
          v-model:value="formState.parentId"
          :tree-data="[{ id: 0, name: '顶级部门', children: deptTree }]"
          :field-names="{ label: 'name', value: 'id' }"
          placeholder="请选择上级部门"
          tree-default-expand-all
        />
      </a-form-item>
      <a-form-item label="部门名称" name="name">
        <a-input v-model:value="formState.name" placeholder="请输入部门名称" />
      </a-form-item>
      <a-form-item label="排序" name="sort">
        <a-input-number v-model:value="formState.sort" :min="0" style="width: 100%" />
      </a-form-item>
      <a-form-item label="负责人" name="leader">
        <a-input v-model:value="formState.leader" placeholder="请输入负责人" />
      </a-form-item>
      <a-form-item label="联系电话" name="phone">
        <a-input v-model:value="formState.phone" placeholder="请输入联系电话" />
      </a-form-item>
      <a-form-item label="邮箱" name="email">
        <a-input v-model:value="formState.email" placeholder="请输入邮箱" />
      </a-form-item>
      <a-form-item label="状态" name="status">
        <a-radio-group v-model:value="formState.status">
          <a-radio :value="1">正常</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { message, type FormInstance, type Rule } from 'ant-design-vue';
import { getDeptDetail, createDept, updateDept, getDeptTreeSelect } from '@/api/dept';

const props = defineProps<{
  open: boolean;
  deptId?: number;
  parentId?: number;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'success'): void;
}>();

const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
});

const isEdit = computed(() => !!props.deptId);

const formRef = ref<FormInstance>();
const loading = ref(false);

const formState = reactive({
  parentId: 0,
  name: '',
  sort: 0,
  leader: '',
  phone: '',
  email: '',
  status: 1,
});

const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入部门名称' }],
};

// 部门树
const deptTree = ref<any[]>([]);

// 监听弹窗打开
watch(
  () => props.open,
  async (val) => {
    if (val) {
      await loadDepts();

      if (props.deptId) {
        await loadDeptDetail();
      } else if (props.parentId !== undefined) {
        formState.parentId = props.parentId;
      }
    }
  },
);

// 加载部门树
async function loadDepts() {
  deptTree.value = await getDeptTreeSelect();
}

// 加载部门详情
async function loadDeptDetail() {
  const dept = await getDeptDetail(props.deptId!);
  Object.assign(formState, {
    parentId: dept.parentId,
    name: dept.name,
    sort: dept.sort,
    leader: dept.leader || '',
    phone: dept.phone || '',
    email: dept.email || '',
    status: dept.status,
  });
}

// 提交
async function handleSubmit() {
  try {
    await formRef.value?.validateFields();
    loading.value = true;

    if (isEdit.value) {
      await updateDept(props.deptId!, formState);
      message.success('更新成功');
    } else {
      await createDept(formState);
      message.success('创建成功');
    }

    visible.value = false;
    emit('success');
  } catch (error) {
    // 表单验证失败
  } finally {
    loading.value = false;
  }
}

// 取消
function handleCancel() {
  formRef.value?.resetFields();
  Object.assign(formState, {
    parentId: 0,
    name: '',
    sort: 0,
    leader: '',
    phone: '',
    email: '',
    status: 1,
  });
}
</script>
