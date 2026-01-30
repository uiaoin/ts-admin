<template>
  <a-modal
    v-model:open="visible"
    :title="isEdit ? '编辑字典数据' : '新增字典数据'"
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
      <a-form-item label="字典标签" name="label">
        <a-input v-model:value="formState.label" placeholder="请输入字典标签" />
      </a-form-item>
      <a-form-item label="字典值" name="value">
        <a-input v-model:value="formState.value" placeholder="请输入字典值" />
      </a-form-item>
      <a-form-item label="排序" name="sort">
        <a-input-number v-model:value="formState.sort" :min="0" style="width: 100%" />
      </a-form-item>
      <a-form-item label="是否默认" name="isDefault">
        <a-radio-group v-model:value="formState.isDefault">
          <a-radio :value="1">是</a-radio>
          <a-radio :value="0">否</a-radio>
        </a-radio-group>
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
import { getDictDataDetail, createDictData, updateDictData } from '@/api/dict';

const props = defineProps<{
  open: boolean;
  dictType: string;
  dictDataId?: number;
}>();

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void;
  (e: 'success'): void;
}>();

const visible = computed({
  get: () => props.open,
  set: (val) => emit('update:open', val),
});

const isEdit = computed(() => !!props.dictDataId);

const formRef = ref<FormInstance>();
const loading = ref(false);

const formState = reactive({
  label: '',
  value: '',
  sort: 0,
  isDefault: 0,
  status: 1,
  remark: '',
});

const rules: Record<string, Rule[]> = {
  label: [{ required: true, message: '请输入字典标签' }],
  value: [{ required: true, message: '请输入字典值' }],
};

watch(
  () => props.open,
  async (val) => {
    if (val && props.dictDataId) {
      const data = await getDictDataDetail(props.dictDataId);
      Object.assign(formState, {
        label: data.label,
        value: data.value,
        sort: data.sort,
        isDefault: data.isDefault,
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
      await updateDictData(props.dictDataId!, formState);
      message.success('更新成功');
    } else {
      await createDictData({ ...formState, dictType: props.dictType });
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
  Object.assign(formState, { label: '', value: '', sort: 0, isDefault: 0, status: 1, remark: '' });
}
</script>
