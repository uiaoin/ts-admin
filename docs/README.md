# TS Admin Framework 系统文档

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | NestJS + Prisma + PostgreSQL + Redis |
| 前端 | Vue3 + Ant Design Vue + Pinia + Vite |
| 认证 | JWT (双Token机制) |
| 部署 | Docker / Docker Compose |

## 项目结构

```
framework/
├── apps/
│   ├── server/          # NestJS 后端
│   │   ├── prisma/      # 数据库 Schema 和 Seed
│   │   └── src/
│   │       ├── common/  # 公共模块 (Prisma, Redis, 装饰器, 过滤器)
│   │       └── modules/ # 业务模块
│   └── admin/           # Vue3 管理后台
│       └── src/
│           ├── api/     # API 接口
│           ├── stores/  # 状态管理
│           ├── router/  # 路由配置
│           └── views/   # 页面组件
├── packages/
│   ├── types/           # 共享类型定义
│   └── utils/           # 共享工具函数
└── docs/                # 项目文档
```

## 核心功能

### 1. 认证授权
- JWT 双 Token 机制 (Access Token 15分钟, Refresh Token 7天)
- RBAC 权限控制 (用户-角色-菜单)
- 数据权限 (全部/本部门及以下/本部门/仅本人)

### 2. 系统管理
- 用户管理：增删改查、状态切换、密码重置
- 角色管理：权限分配、数据范围设置
- 菜单管理：目录/菜单/按钮三级结构
- 部门管理：树形组织架构
- 字典管理：系统参数配置

### 3. 系统监控
- 操作日志：记录用户操作行为
- 登录日志：记录登录信息
- 服务器监控：CPU、内存、Node.js 信息
- 缓存监控：Redis 状态和键值管理

## API 接口

### 认证接口
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/refresh | 刷新Token |
| POST | /api/auth/logout | 退出登录 |
| GET | /api/auth/info | 获取用户信息 |
| GET | /api/auth/menus | 获取用户菜单 |

### 用户接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/system/user | 用户列表 |
| POST | /api/system/user | 创建用户 |
| PUT | /api/system/user/:id | 更新用户 |
| DELETE | /api/system/user/:id | 删除用户 |

### 角色接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/system/role | 角色列表 |
| POST | /api/system/role | 创建角色 |
| PUT | /api/system/role/:id | 更新角色 |
| DELETE | /api/system/role/:id | 删除角色 |

### 菜单接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/system/menu | 菜单列表 |
| POST | /api/system/menu | 创建菜单 |
| PUT | /api/system/menu/:id | 更新菜单 |
| DELETE | /api/system/menu/:id | 删除菜单 |

### 监控接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/monitor/server | 服务器信息 |
| GET | /api/monitor/cache | 缓存信息 |
| GET | /api/monitor/operlog | 操作日志 |
| GET | /api/monitor/loginlog | 登录日志 |

### 微信授权接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/wechat/auth-url | 获取微信授权URL |
| GET | /api/wechat/callback | 微信授权回调 |
| POST | /api/wechat/login | 微信登录 (前端传code) |
| POST | /api/wechat/bind | 绑定微信账号 |
| POST | /api/wechat/unbind | 解绑微信账号 |

> 完整 API 文档: http://localhost:3000/api/docs

## 默认账号

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 超级管理员 | admin | admin123 | 全部 |
| 普通用户 | test | admin123 | 只读 |

## 快速启动

```bash
# 1. 启动数据库
docker-compose -f docker-compose.dev.yml up -d

# 2. 安装依赖
pnpm install

# 3. 初始化数据库
pnpm build:packages
cd apps/server
npx prisma db push
npx prisma db seed

# 4. 启动服务
pnpm dev:server  # 后端 http://localhost:3000
pnpm dev:admin   # 前端 http://localhost:5173
```

## 环境变量

复制 `.env.example` 到 `apps/server/.env`，主要配置：

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/ts_admin"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
```
