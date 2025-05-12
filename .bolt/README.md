# 分布式融合数据库与存储管理系统

## 项目概述

这是一个现代化的分布式数据库与存储管理系统，支持多种类型的数据库管理，包括关系型、时序型、向量型和地理空间型数据库。系统提供了统一的管理界面，使用户能够方便地进行数据库操作、监控和维护。

## 主要功能

- **多类型数据库管理**：支持关系型、时序型、向量型和地理空间型数据库
- **集群管理**：节点和分片管理
- **数据模型管理**：表结构管理和数据导入导出
- **安全管理**：用户权限和访问控制
- **监控与维护**：性能监控和备份管理
- **存储管理**：文件存储、对象存储和块存储

## 技术栈

- **前端**：Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **API**：RESTful API
- **数据可视化**：Recharts
- **状态管理**：React Hooks

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 启动生产服务器

```bash
npm run start
```

## API 文档

API 文档位于 `.bolt/api-docs.json` 文件中，采用 OpenAPI 3.0 规范。

## 项目结构

```
.
├── api/                  # API 接口定义
│   ├── cluster/          # 集群管理 API
│   ├── database/         # 数据库管理 API
│   │   ├── geospatial/   # 地理空间数据库 API
│   │   ├── relational/   # 关系型数据库 API
│   │   ├── timeseries/   # 时序数据库 API
│   │   └── vector/       # 向量数据库 API
│   ├── data-model/       # 数据模型 API
│   ├── monitoring/       # 监控 API
│   ├── security/         # 安全 API
│   ├── storage/          # 存储 API
│   └── system/           # 系统 API
├── app/                  # Next.js 应用
│   ├── dashboard/        # 仪表盘页面
│   └── ...
├── components/           # React 组件
│   ├── dashboard/        # 仪表盘组件
│   └── ui/               # UI 组件
├── lib/                  # 工具库
│   ├── api/              # API 客户端
│   └── utils.ts          # 工具函数
├── mock/                 # 模拟数据
│   └── dashboard/        # 仪表盘模拟数据
├── public/               # 静态资源
├── styles/               # 样式文件
├── .bolt/                # Bolt 配置
└── ...
```

## 贡献指南

1. 创建功能分支
2. 提交更改
3. 创建 Pull Request
4. 等待代码审查

## 许可证

MIT