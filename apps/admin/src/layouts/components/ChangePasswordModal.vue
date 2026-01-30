<template>
  <a-modal
    v-model:open="visible"
    title="修改密码"
    :confirm-loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
    >
      <a-form-item label="原密码" name="oldPassword">
        <a-input-password v-model:value="formState.oldPassword" placeholder="请输入原密码" />
      </a-form-item>
      <a-form-item label="新密码" name="newPassword">
        <a-input-password v-model:value="formState.newPassword" placeholder="请输入新密码" />
      </a-form-item>
      <a-form-item label="确认密码" name="confirmPassword">
        <a-input-password v-model:value="formState.confirmPassword" placeholder="请再次输入新密码" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { message, type FormInstance, type Rule } from 'ant-design-vue';
import { changePassword } from '@/api/auth';
import { useUserStore } from '@/stores';
import { useRouter } from 'vue-router';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
}>();

const router = useRouter();
const userStore = useUserStore();

const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
});

const formRef = ref<FormInstance>();
const loading = ref(false);

const formState = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const rules: Record<string, Rule[]> = {
  oldPassword: [{ required: true, message: '请输入原密码' }],
  newPassword: [
    { required: true, message: '请输入新密码' },
    { min: 6, message: '密码至少6个字符' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码' },
    {
      validator: async (_rule, value) => {
        if (value !== formState.newPassword) {
          return Promise.reject('两次输入的密码不一致');
        }
        return Promise.resolve();
      },
    },
  ],
};

async function handleSubmit() {
  try {
    await formRef.value?.validateFields();
    loading.value = true;

    await changePassword({
      oldPassword: formState.oldPassword,
      newPassword: formState.newPassword,
    });

    message.success('密码修改成功，请重新登录');
    visible.value = false;

    // 退出登录
    await userStore.logout();
    router.push('/login');
  } catch (error) {
    // 表单验证失败或接口错误
  } finally {
    loading.value = false;
  }
}

function handleCancel() {
  formRef.value?.resetFields();
}
</script>
