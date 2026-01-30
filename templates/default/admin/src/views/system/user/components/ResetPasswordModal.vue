<template>
  <a-modal
    v-model:open="visible"
    title="重置密码"
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
      <a-form-item label="新密码" name="password">
        <a-input-password v-model:value="formState.password" placeholder="请输入新密码" />
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
import { resetPassword } from '@/api/user';

const props = defineProps<{
  open: boolean;
  userId?: number;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
}>();

const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
});

const formRef = ref<FormInstance>();
const loading = ref(false);

const formState = reactive({
  password: '',
  confirmPassword: '',
});

const rules: Record<string, Rule[]> = {
  password: [
    { required: true, message: '请输入新密码' },
    { min: 6, message: '密码至少6个字符' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码' },
    {
      validator: async (_rule, value) => {
        if (value !== formState.password) {
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

    await resetPassword(props.userId!, formState.password);
    message.success('密码重置成功');
    visible.value = false;
  } catch (error) {
    // 表单验证失败
  } finally {
    loading.value = false;
  }
}

function handleCancel() {
  formRef.value?.resetFields();
}
</script>
