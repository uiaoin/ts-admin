# TS Admin Project

基于 [TS Admin Framework](https://github.com/uiaoin/ts-admin) 创建的项目。

## 快速开始

### 1. 配置 GitHub Packages 访问

本项目使用 GitHub Packages 托管的 NPM 包，需要先配置访问权限：

```bash
# 登录 GitHub Packages（需要 GitHub Token，权限: read:packages）
# 获取 Token: https://github.com/settings/tokens/new
npm login --registry=https://npm.pkg.github.com
# Username: 你的 GitHub 用户名
# Password: 你的 GitHub Token
# Email: 你的邮箱
```

### 2. 安装和启动

```bash
# 安装依赖
pnpm install

# 启动数据库
docker-compose up -d

# 配置环境变量
cp .env.example server/.env

# 初始化数据库
pnpm db:push
pnpm db:seed

# 启动开发服务
pnpm dev
```

- 后端: http://localhost:3000
- 前端: http://localhost:5173
- API文档: http://localhost:3000/api/docs

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |
| 普通用户 | test | admin123 |

## 项目结构

```
├── server/          # NestJS 后端
│   ├── prisma/      # 数据库 Schema
│   └── src/
│       ├── common/  # 公共模块
│       └── modules/ # 业务模块
├── admin/           # Vue3 管理后台
│   └── src/
│       ├── api/     # API 接口
│       ├── stores/  # 状态管理
│       └── views/   # 页面组件
└── packages/
    ├── types/       # 共享类型
    └── utils/       # 工具函数
```

## 开发指南

### 添加新模块

```bash
# 后端
cd server
nest g module modules/your-module
nest g controller modules/your-module
nest g service modules/your-module

# 前端
# 在 admin/src/views/ 下创建页面
# 在 admin/src/api/ 下创建接口
```

### 数据库操作

```bash
pnpm db:push      # 同步 Schema 到数据库
pnpm db:generate  # 生成 Prisma Client
pnpm db:seed      # 运行种子数据
```

## 许可证

MIT
