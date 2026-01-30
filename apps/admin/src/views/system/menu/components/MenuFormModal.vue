<template>
  <a-modal
    v-model:open="visible"
    :title="isEdit ? '编辑菜单' : '新增菜单'"
    :confirm-loading="loading"
    width="650px"
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
      <a-form-item label="上级菜单" name="parentId">
        <a-tree-select
          v-model:value="formState.parentId"
          :tree-data="[{ id: 0, name: '主目录', children: menuTree }]"
          :field-names="{ label: 'name', value: 'id' }"
          placeholder="请选择上级菜单"
          tree-default-expand-all
        />
      </a-form-item>
      <a-form-item label="菜单类型" name="type">
        <a-radio-group v-model:value="formState.type">
          <a-radio :value="0">目录</a-radio>
          <a-radio :value="1">菜单</a-radio>
          <a-radio :value="2">按钮</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="菜单名称" name="name">
        <a-input v-model:value="formState.name" placeholder="请输入菜单名称" />
      </a-form-item>
      <a-form-item v-if="formState.type !== 2" label="图标" name="icon">
        <a-input v-model:value="formState.icon" placeholder="请输入图标名称，如 UserOutlined" />
      </a-form-item>
      <a-form-item v-if="formState.type !== 2" label="路由地址" name="path">
        <a-input v-model:value="formState.path" placeholder="请输入路由地址" />
      </a-form-item>
      <a-form-item v-if="formState.type === 1" label="组件路径" name="component">
        <a-input v-model:value="formState.component" placeholder="如 system/user/index" />
      </a-form-item>
      <a-form-item v-if="formState.type !== 0" label="权限标识" name="permission">
        <a-input v-model:value="formState.permission" placeholder="如 system:user:list" />
      </a-form-item>
      <a-form-item label="排序" name="sort">
        <a-input-number v-model:value="formState.sort" :min="0" style="width: 100%" />
      </a-form-item>
      <a-row v-if="formState.type !== 2">
        <a-col :span="12">
          <a-form-item label="是否显示" name="visible" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
            <a-radio-group v-model:value="formState.visible">
              <a-radio :value="1">显示</a-radio>
              <a-radio :value="0">隐藏</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="是否缓存" name="isCache" :label-col="{ span: 10 }" :wrapper-col="{ span: 14 }">
            <a-radio-group v-model:value="formState.isCache">
              <a-radio :value="1">缓存</a-radio>
              <a-radio :value="0">不缓存</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>
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
import { getMenuDetail, createMenu, updateMenu, getMenuTreeSelect } from '@/api/menu';

const props = defineProps<{
  open: boolean;
  menuId?: number;
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

const isEdit = computed(() => !!props.menuId);

const formRef = ref<FormInstance>();
const loading = ref(false);

const formState = reactive({
  parentId: 0,
  type: 1,
  name: '',
  icon: '',
  path: '',
  component: '',
  permission: '',
  sort: 0,
  visible: 1,
  isCache: 1,
  status: 1,
});

const rules: Record<string, Rule[]> = {
  name: [{ required: true, message: '请输入菜单名称' }],
  type: [{ required: true, message: '请选择菜单类型' }],
};

// 菜单树
const menuTree = ref<any[]>([]);

// 监听弹窗打开
watch(
  () => props.open,
  async (val) => {
    if (val) {
      await loadMenus();

      if (props.menuId) {
        await loadMenuDetail();
      } else if (props.parentId !== undefined) {
        formState.parentId = props.parentId;
      }
    }
  },
);

// 加载菜单树
async function loadMenus() {
  menuTree.value = await getMenuTreeSelect();
}

// 加载菜单详情
async function loadMenuDetail() {
  const menu = await getMenuDetail(props.menuId!);
  Object.assign(formState, {
    parentId: menu.parentId,
    type: menu.type,
    name: menu.name,
    icon: menu.icon || '',
    path: menu.path || '',
    component: menu.component || '',
    permission: menu.permission || '',
    sort: menu.sort,
    visible: menu.visible,
    isCache: menu.isCache,
    status: menu.status,
  });
}

// 提交
async function handleSubmit() {
  try {
    await formRef.value?.validateFields();
    loading.value = true;

    const data = { ...formState };
    // 清理不需要的字段
    if (data.type === 2) {
      data.icon = '';
      data.path = '';
      data.component = '';
    }
    if (data.type === 0) {
      data.component = '';
      data.permission = '';
    }

    if (isEdit.value) {
      await updateMenu(props.menuId!, data);
      message.success('更新成功');
    } else {
      await createMenu(data);
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
    type: 1,
    name: '',
    icon: '',
    path: '',
    component: '',
    permission: '',
    sort: 0,
    visible: 1,
    isCache: 1,
    status: 1,
  });
}
</script>
