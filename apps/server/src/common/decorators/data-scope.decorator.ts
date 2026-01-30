import { SetMetadata } from '@nestjs/common';

export const DATA_SCOPE_KEY = 'dataScope';

export interface DataScopeOptions {
  /** 部门ID字段名，默认 deptId */
  deptField?: string;
  /** 用户ID字段名，默认 userId */
  userField?: string;
  /** 是否包含本人数据，默认 true */
  includeSelf?: boolean;
}

/**
 * 数据权限装饰器
 * @param options 配置项
 * @example
 * @DataScope()
 * @Get('list')
 * async findAll(@Query() query, @DataFilter() filter) {}
 */
export const DataScope = (options?: DataScopeOptions) =>
  SetMetadata(DATA_SCOPE_KEY, options || {});
