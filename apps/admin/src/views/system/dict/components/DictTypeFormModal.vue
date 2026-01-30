<template>
  <a-modal
    v-model:open="visible"
    :title="isEdit ? '编辑字典类型' : '新增字典类型'"
    :confirm-loading="loading"
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
      <a-form-item label="字典名称" name="name">
        <a-input v-model:value="formState.name" placeholder="请输入字典名称" />
      </a-form-item>
      <a-form-item label="字典类型" name="type">
        <a-input v-model:value="formState.type" placeholder="请输入字典类型" />
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
import { getDictTypeDetail, createDictType, updateDictType } from '@/api/dict';

const props = defineProps<{
  open: boolean;
  dictTypeId?: number;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'success'): void;
}>();

const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
});

const isEdit = computed(() => !!props.dictTypeId);

const formRef = ref<FormInstance>();
const loading = ref(false);

const formState = reactive({
  name: '',
  type: '',
  status: 1,
  remark: '',
});

const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入字典名称' }],
  type: [{ required: true, message: '请输入字典类型' }],
};

watch(
  () => props.open,
  async (val) => {
    if (val && props.dictTypeId) {
      const data = await getDictTypeDetail(props.dictTypeId);
      Object.assign(formState, {
        name: data.name,
        type: data.type,
        status: data.status,
        remark: data.remark || '',
      });
    }
  },
);

async function handleSubmit() {
  try {
    await formRef.value?.validateFields();
    loading.value = true;

    if (isEdit.value) {
      await updateDictType(props.dictTypeId!, formState);
      message.success('更新成功');
    } else {
      await createDictType(formState);
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

function handleCancel() {
  formRef.value?.resetFields();
  Object.assign(formState, { name: '', type: '', status: 1, remark: '' });
}
</script>
