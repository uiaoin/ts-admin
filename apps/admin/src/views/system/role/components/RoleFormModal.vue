<template>
  <a-modal
    v-model:open="visible"
    :title="isEdit ? '编辑角色' : '新增角色'"
    :confirm-loading="loading"
    width="600px"
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
      <a-form-item label="角色名称" name="name">
        <a-input v-model:value="formState.name" placeholder="请输入角色名称" />
      </a-form-item>
      <a-form-item label="角色编码" name="code">
        <a-input v-model:value="formState.code" placeholder="请输入角色编码" :disabled="isEdit" />
      </a-form-item>
      <a-form-item label="排序" name="sort">
        <a-input-number v-model:value="formState.sort" :min="0" style="width: 100%" />
      </a-form-item>
      <a-form-item label="数据权限" name="dataScope">
        <a-select v-model:value="formState.dataScope">
          <a-select-option :value="1">全部数据</a-select-option>
          <a-select-option :value="2">本部门及以下</a-select-option>
          <a-select-option :value="3">本部门</a-select-option>
          <a-select-option :value="4">仅本人</a-select-option>
          <a-select-option :value="5">自定义</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item v-if="formState.dataScope === 5" label="数据权限范围" name="deptIds">
        <a-tree-select
          v-model:value="formState.deptIds"
          :tree-data="deptTree"
          :field-names="{ label: 'name', value: 'id' }"
          placeholder="请选择部门"
          multiple
          tree-checkable
          tree-default-expand-all
        />
      </a-form-item>
      <a-form-item label="菜单权限" name="menuIds">
        <div style="border: 1px solid #d9d9d9; border-radius: 4px; padding: 8px; max-height: 300px; overflow: auto;">
          <a-tree
            v-model:checkedKeys="formState.menuIds"
            :tree-data="menuTree"
            :field-names="{ title: 'name', key: 'id' }"
            checkable
            default-expand-all
          />
        </div>
      </a-form-item>
      <a-form-item label="状态" name="status">
        <a-radio-group v-model:value="formState.status">
          <a-radio :value="1">正常</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="备注" name="remark">
        <a-textarea v-model:value="formState.remark" placeholder="请输入备注" :rows="3" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { message, type FormInstance, type Rule } from 'ant-design-vue';
import { getRoleDetail, createRole, updateRole } from '@/api/role';
import { getMenuTreeSelect } from '@/api/menu';
import { getDeptTreeSelect } from '@/api/dept';

const props = defineProps<{
  open: boolean;
  roleId?: number;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'success'): void;
}>();

const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
});

const isEdit = computed(() => !!props.roleId);

const formRef = ref<FormInstance>();
const loading = ref(false);

const formState = reactive({
  name: '',
  code: '',
  sort: 0,
  dataScope: 1,
  menuIds: [] as number[],
  deptIds: [] as number[],
  status: 1,
  remark: '',
});

const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入角色名称' }],
  code: [{ required: true, message: '请输入角色编码' }],
};

// 菜单树
const menuTree = ref<any[]>([]);
// 部门树
const deptTree = ref<any[]>([]);

// 监听弹窗打开
watch(
  () => props.open,
  async (val) => {
    if (val) {
      await Promise.all([loadMenus(), loadDepts()]);

      if (props.roleId) {
        await loadRoleDetail();
      }
    }
  },
);

// 加载菜单
async function loadMenus() {
  menuTree.value = await getMenuTreeSelect();
}

// 加载部门
async function loadDepts() {
  deptTree.value = await getDeptTreeSelect();
}

// 加载角色详情
async function loadRoleDetail() {
  const role = await getRoleDetail(props.roleId!);
  Object.assign(formState, {
    name: role.name,
    code: role.code,
    sort: role.sort,
    dataScope: role.dataScope,
    menuIds: role.menuIds || [],
    deptIds: role.deptIds || [],
    status: role.status,
    remark: role.remark,
  });
}

// 提交
async function handleSubmit() {
  try {
    await formRef.value?.validateFields();
    loading.value = true;

    if (isEdit.value) {
      await updateRole(props.roleId!, formState);
      message.success('更新成功');
    } else {
      await createRole(formState);
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
    name: '',
    code: '',
    sort: 0,
    dataScope: 1,
    menuIds: [],
    deptIds: [],
    status: 1,
    remark: '',
  });
}
</script>
