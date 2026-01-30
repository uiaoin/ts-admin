# 数据库设计

## ER 关系

```
User ──┬── UserRole ──── Role ──── RoleMenu ──── Menu
       └── Dept
```

## 数据表

### sys_user (用户表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| username | varchar(50) | 用户名 (唯一) |
| password | varchar(255) | 密码 (bcrypt) |
| nickname | varchar(50) | 昵称 |
| email | varchar(100) | 邮箱 |
| phone | varchar(20) | 手机号 |
| avatar | varchar(255) | 头像 |
| dept_id | int | 部门ID |
| status | int | 状态 (1启用/0禁用) |
| remark | text | 备注 |

### sys_role (角色表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| name | varchar(50) | 角色名称 |
| code | varchar(50) | 角色编码 (唯一) |
| sort | int | 排序 |
| status | int | 状态 |
| data_scope | int | 数据范围 (1全部/2本部门及以下/3本部门/4仅本人) |
| remark | text | 备注 |

### sys_menu (菜单表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| parent_id | int | 父级ID |
| name | varchar(50) | 菜单名称 |
| path | varchar(200) | 路由路径 |
| component | varchar(255) | 组件路径 |
| permission | varchar(100) | 权限标识 |
| type | int | 类型 (0目录/1菜单/2按钮) |
| icon | varchar(50) | 图标 |
| sort | int | 排序 |
| visible | int | 是否显示 |
| status | int | 状态 |

### sys_dept (部门表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 主键 |
| parent_id | int | 父级ID |
| ancestors | varchar(500) | 祖级列表 |
| name | varchar(50) | 部门名称 |
| sort | int | 排序 |
| leader | varchar(50) | 负责人 |
| phone | varchar(20) | 联系电话 |
| email | varchar(100) | 邮箱 |
| status | int | 状态 |

### sys_dict_type / sys_dict_data (字典表)
用于存储系统配置项，如状态选项、类型选项等。

### sys_oper_log / sys_login_log (日志表)
记录用户操作和登录行为。
