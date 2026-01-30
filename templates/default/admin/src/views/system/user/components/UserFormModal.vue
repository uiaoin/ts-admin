<template>
  <a-modal
    v-model:open="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
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
      <a-form-item label="用户名" name="username">
        <a-input v-model:value="formState.username" placeholder="请输入用户名" :disabled="isEdit" />
      </a-form-item>
      <a-form-item v-if="!isEdit" label="密码" name="password">
        <a-input-password v-model:value="formState.password" placeholder="请输入密码" />
      </a-form-item>
      <a-form-item label="昵称" name="nickname">
        <a-input v-model:value="formState.nickname" placeholder="请输入昵称" />
      </a-form-item>
      <a-form-item label="手机号" name="phone">
        <a-input v-model:value="formState.phone" placeholder="请输入手机号" />
      </a-form-item>
      <a-form-item label="邮箱" name="email">
        <a-input v-model:value="formState.email" placeholder="请输入邮箱" />
      </a-form-item>
      <a-form-item label="性别" name="gender">
        <a-radio-group v-model:value="formState.gender">
          <a-radio :value="0">未知</a-radio>
          <a-radio :value="1">男</a-radio>
          <a-radio :value="2">女</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="部门" name="deptId">
        <a-tree-select
          v-model:value="formState.deptId"
          :tree-data="deptTree"
          :field-names="{ label: 'name', value: 'id' }"
          placeholder="请选择部门"
          allow-clear
          tree-default-expand-all
        />
      </a-form-item>
      <a-form-item label="角色" name="roleIds">
        <a-select
          v-model:value="formState.roleIds"
          mode="multiple"
          placeholder="请选择角色"
          :options="roleOptions"
          :field-names="{ label: 'name', value: 'id' }"
        />
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
import { getUserDetail, createUser, updateUser } from '@/api/user';
import { getAllRoles } from '@/api/role';
import { getDeptTreeSelect } from '@/api/dept';

const props = defineProps<{
  open: boolean;
  userId?: number;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'success'): void;
}>();

const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
});

const isEdit = computed(() => !!props.userId);

const formRef = ref<FormInstance>();
const loading = ref(false);

const formState = reactive({
  username: '',
  password: '',
  nickname: '',
  phone: '',
  email: '',
  gender: 0,
  deptId: undefined as number | undefined,
  roleIds: [] as number[],
  status: 1,
  remark: '',
});

const rules: Record<string, Rule[]> = {
  username: [
    { required: true, message: '请输入用户名' },
    { min: 2, max: 50, message: '用户名长度在2-50个字符' },
  ],
  password: [
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少6个字符' },
  ],
};

// 角色选项
const roleOptions = ref<any[]>([]);
// 部门树
const deptTree = ref<any[]>([]);

// 监听弹窗打开
watch(
  () => props.open,
  async (val) => {
    if (val) {
      // 加载角色和部门数据
      await Promise.all([loadRoles(), loadDepts()]);

      if (props.userId) {
        await loadUserDetail();
      }
    }
  },
);

// 加载角色
async function loadRoles() {
  roleOptions.value = await getAllRoles();
}

// 加载部门
async function loadDepts() {
  deptTree.value = await getDeptTreeSelect();
}

// 加载用户详情
async function loadUserDetail() {
  const user = await getUserDetail(props.userId!);
  Object.assign(formState, {
    username: user.username,
    nickname: user.nickname,
    phone: user.phone,
    email: user.email,
    gender: user.gender,
    deptId: user.deptId,
    roleIds: user.roleIds || [],
    status: user.status,
    remark: user.remark,
  });
}

// 提交
async function handleSubmit() {
  try {
    await formRef.value?.validateFields();
    loading.value = true;

    if (isEdit.value) {
      const { password, ...data } = formState;
      await updateUser(props.userId!, data);
      message.success('更新成功');
    } else {
      await createUser(formState);
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
    username: '',
    password: '',
    nickname: '',
    phone: '',
    email: '',
    gender: 0,
    deptId: undefined,
    roleIds: [],
    status: 1,
    remark: '',
  });
}
</script>
