# TS Admin Framework

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red.svg)](https://nestjs.com/)
[![Vue](https://img.shields.io/badge/Vue-3.4-green.svg)](https://vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

TypeScript 全栈后台管理框架，基于 NestJS + Vue3 + Ant Design Vue，开箱即用的企业级中后台解决方案。

## 特性

- **全栈 TypeScript** - 前后端统一语言，类型安全
- **RBAC 权限** - 用户、角色、菜单、数据权限完整实现
- **JWT 认证** - 双 Token 机制，安全可靠
- **微信登录** - 开箱即用的微信网页授权
- **文件存储** - 支持本地/七牛云，可扩展
- **系统监控** - 服务器状态、缓存、日志一目了然
- **AI 友好** - 结构清晰，便于 AI 辅助开发

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | NestJS + Prisma + PostgreSQL + Redis |
| 前端 | Vue3 + Ant Design Vue + Pinia + Vite |
| 认证 | JWT (双Token机制) |
| 部署 | Docker / Docker Compose |

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 9
- PostgreSQL >= 14
- Redis >= 6

### 安装

```bash
# 克隆项目
git clone https://github.com/your-username/ts-admin.git
cd ts-admin

# 安装依赖
pnpm install

# 启动数据库（Docker）
docker-compose -f docker-compose.dev.yml up -d

# 配置环境变量
cp .env.example apps/server/.env
# 编辑 apps/server/.env 配置数据库等信息

# 初始化数据库
pnpm build:packages
cd apps/server
npx prisma db push
npx prisma db seed
cd ../..

# 启动开发服务
pnpm dev:server  # 后端 http://localhost:3000
pnpm dev:admin   # 前端 http://localhost:5173
```

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 超级管理员 | admin | admin123 |
| 普通用户 | test | admin123 |

## 项目结构

```
ts-admin/
├── apps/
│   ├── server/          # NestJS 后端
│   │   ├── prisma/      # 数据库 Schema
│   │   └── src/
│   │       ├── common/  # 公共模块
│   │       └── modules/ # 业务模块
│   └── admin/           # Vue3 管理后台
│       └── src/
│           ├── api/     # API 接口
│           ├── stores/  # 状态管理
│           └── views/   # 页面组件
├── packages/
│   ├── types/           # 共享类型
│   └── utils/           # 共享工具
└── docs/                # 项目文档
```

## 功能模块

### 系统管理
- 用户管理 - 增删改查、状态切换、密码重置
- 角色管理 - 权限分配、数据范围设置
- 菜单管理 - 目录/菜单/按钮三级结构
- 部门管理 - 树形组织架构
- 字典管理 - 系统参数配置

### 系统监控
- 操作日志 - 记录用户操作行为
- 登录日志 - 记录登录信息
- 服务器监控 - CPU、内存、Node.js 信息
- 缓存监控 - Redis 状态和键值管理

### 扩展功能
- 微信网页授权
- 七牛云文件存储
- 阿里云 OSS（待实现）
- 腾讯云 COS（待实现）

## API 文档

启动后端后访问 Swagger 文档：

```
http://localhost:3000/api/docs
```

## 配置说明

主要环境变量（`apps/server/.env`）：

```env
# 数据库
DATABASE_URL="postgresql://user:pass@localhost:5432/ts_admin"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# 文件存储 (local/qiniu)
FILE_STORAGE=local

# 微信公众号（可选）
WECHAT_APP_ID=
WECHAT_APP_SECRET=
```

## 部署

### Docker 部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 手动部署

```bash
# 构建
pnpm build

# 启动后端
cd apps/server && node dist/main.js

# 前端静态文件部署到 Nginx
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

[MIT](LICENSE)

## 致谢

- [NestJS](https://nestjs.com/)
- [Vue.js](https://vuejs.org/)
- [Ant Design Vue](https://antdv.com/)
- [Prisma](https://www.prisma.io/)
