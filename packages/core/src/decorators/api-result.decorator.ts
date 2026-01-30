import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

/**
 * 统一API响应装饰器
 * @param model 响应数据的DTO类
 * @param isArray 是否是数组
 * @example
 * @ApiResult(UserVo)
 * @Get(':id')
 * async findOne() {}
 *
 * @ApiResult(UserVo, true)
 * @Get()
 * async findAll() {}
 */
export const ApiResult = <TModel extends Type<any>>(
  model?: TModel,
  isArray?: boolean,
) => {
  const dataSchema = model
    ? isArray
      ? { type: 'array', items: { $ref: getSchemaPath(model) } }
      : { $ref: getSchemaPath(model) }
    : { type: 'object' };

  return applyDecorators(
    ApiExtraModels(model || class {}),
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: 200 },
          message: { type: 'string', example: 'success' },
          data: dataSchema,
        },
      },
    }),
  );
};
