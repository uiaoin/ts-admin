# TS Admin Framework

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.0-red.svg)](https://nestjs.com/)
[![Vue](https://img.shields.io/badge/Vue-3.4-green.svg)](https://vuejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

TypeScript 全栈后台管理框架，基于 NestJS + Vue3 + Ant Design Vue，开箱即用的企业级中后台解决方案。

## 特性

- **全栈 TypeScript** - 前后端统一语言，类型安全
- **模块化设计** - 核心模块可独立发布为 NPM 包
- **RBAC 权限** - 用户、角色、菜单、数据权限完整实现
- **JWT 认证** - 双 Token 机制，安全可靠
- **微信登录** - 开箱即用的微信网页授权
- **文件存储** - 支持本地/七牛云，可扩展
- **系统监控** - 服务器状态、缓存、日志一目了然
- **CLI 工具** - 一键创建新项目

## 项目结构

```
ts-admin/
├── packages/
│   ├── core/           # @ts-admin/core - 核心模块
│   ├── types/          # @ts-admin/types - 共享类型
│   ├── utils/          # @ts-admin/utils - 工具函数
│   └── create-app/     # create-ts-admin - CLI工具
├── templates/
│   └── default/        # 默认模板
│       ├── server/     # NestJS 后端
│       └── admin/      # Vue3 管理后台
├── examples/           # 示例项目
└── docs/               # 项目文档
```

## 快速开始

### 方式一：使用 CLI 创建项目（推荐）

```bash
# 使用 npx
npx create-ts-admin my-project

# 或使用 pnpm
pnpm create ts-admin my-project
```

### 方式二：使用 GitHub Template

1. 点击 GitHub 仓库的 "Use this template" 按钮
2. 克隆你的新仓库
3. 按下面的步骤配置和启动

### 环境要求

- Node.js >= 18
- pnpm >= 9
- PostgreSQL >= 14
- Redis >= 6

### 安装和启动

```bash
# 安装依赖
pnpm install

# 启动数据库（Docker）
pnpm docker:dev

# 配置环境变量
cp .env.example templates/default/server/.env
# 编辑 .env 配置数据库等信息

# 初始化数据库
pnpm db:push
pnpm db:seed

# 启动开发服务
pnpm dev
# 后端 http://localhost:3000
# 前端 http://localhost:5173
```

### 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 超级管理员 | admin | admin123 |
| 普通用户 | test | admin123 |

## NPM 包

### @ts-admin/core

NestJS 核心模块，包含：
- Prisma/Redis 模块
- JWT 认证 Guards/Strategies
- 权限装饰器
- 统一响应拦截器
- 异常过滤器

```bash
pnpm add @ts-admin/core
```

### @ts-admin/types

共享 TypeScript 类型定义

```bash
pnpm add @ts-admin/types
```

### @ts-admin/utils

通用工具函数（树结构处理等）

```bash
pnpm add @ts-admin/utils
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

## API 文档

启动后端后访问 Swagger 文档：

```
http://localhost:3000/api/docs
```

## 开发指南

### 发布 NPM 包

```bash
# 构建所有包
pnpm build:packages

# 发布（需要 NPM 账号权限）
cd packages/core && npm publish
cd packages/types && npm publish
cd packages/utils && npm publish
cd packages/create-app && npm publish
```

### 添加新功能到模板

1. 在 `templates/default/` 中开发新功能
2. 测试通过后更新版本号
3. 提取可复用代码到 `packages/core`

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

[MIT](LICENSE)
