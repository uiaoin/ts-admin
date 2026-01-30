import type { App, Directive, DirectiveBinding } from 'vue';
import { useUserStore } from '@/stores/user';

/**
 * 权限指令
 * 用法:
 *   v-permission="'system:user:add'"
 *   v-permission="['system:user:add', 'system:user:edit']"
 */
const permissionDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const { value } = binding;

    if (!value) {
      return;
    }

    const userStore = useUserStore();

    if (!userStore.hasPermission(value)) {
      // 移除元素
      el.parentNode?.removeChild(el);
    }
  },
};

/**
 * 角色指令
 * 用法:
 *   v-role="'admin'"
 *   v-role="['admin', 'editor']"
 */
const roleDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
    const { value } = binding;

    if (!value) {
      return;
    }

    const userStore = useUserStore();

    if (!userStore.hasRole(value)) {
      el.parentNode?.removeChild(el);
    }
  },
};

export function setupPermissionDirective(app: App) {
  app.directive('permission', permissionDirective);
  app.directive('role', roleDirective);
}
