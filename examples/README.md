# Examples

这里存放基于 TS Admin Framework 构建的示例项目。

## 目录结构

```
examples/
├── basic/              # 基础示例
├── with-wechat/        # 集成微信登录示例
├── with-qiniu/         # 集成七牛云存储示例
└── full-stack/         # 完整功能示例
```

## 使用方法

```bash
# 进入示例目录
cd examples/basic

# 安装依赖
pnpm install

# 启动服务
pnpm dev
```

## 创建新示例

1. 复制 `templates/default` 目录到 `examples/`
2. 修改示例名称和配置
3. 添加特定功能的实现代码
4. 更新此 README 文件
