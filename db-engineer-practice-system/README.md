# 数据库工程师在线练习系统

## 项目概述

本项目是一个针对软考中级数据库工程师考试的在线练习系统，提供题目练习、学习记录、数据分析等功能，帮助考生高效备考。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia 状态管理
- Element Plus UI 组件库
- ECharts 图表可视化

## 主要功能

### 用户系统

- 登录/注册功能，支持表单验证
- 个人中心，支持头像上传和个人信息修改
- 学习数据概览

### 题目练习系统

- 题目列表，支持多级筛选
- 答题页面，支持计时和题目导航
- 历史记录查看和错题分析

### 数据分析

- 知识点掌握度分析
- 学习趋势图表
- 题型分布雷达图

## 项目结构

```
db-engineer-practice-system/
├── src/
│   ├── assets/            # 静态资源
│   │   ├── common/        # 公共组件
│   │   ├── user/          # 用户相关组件
│   │   ├── exercise/      # 练习相关组件
│   │   └── analytics/     # 分析相关组件
│   ├── router/            # 路由配置
│   ├── stores/            # Pinia 状态
│   ├── styles/            # 全局样式
│   ├── types/             # TypeScript 类型
│   ├── utils/             # 工具函数
│   ├── views/             # 页面
│   │   ├── user/          # 用户页面
│   │   ├── exercise/      # 练习页面
│   │   └── analytics/     # 分析页面
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── public/                # 公共资源
├── index.html             # HTML 模板
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── package.json           # 依赖配置
```

## 安装和运行

### 本地开发

1. 安装依赖

```bash
npm install
```

2. 启动开发服务器

```bash
npm run dev
```

3. 构建生产版本

```bash
npm run build
```

## 响应式设计

项目采用响应式设计，适配不同尺寸的设备：

- 桌面端: ≥ 1200px (三栏布局)
- 平板端: 768px - 1199px (两栏布局)
- 移动端: < 768px (单栏堆叠)

## 设计规范

- 主色调: #2c3e50
- 辅助色: #42b983
- 错误色: #ff5252

## 项目特点

1. 使用 Vue 3 Composition API 和 TypeScript 提供类型安全
2. 按需加载的 Element Plus 组件和 ECharts 图表
3. 移动优先的响应式布局
4. 缓存机制确保页面刷新不丢失进度
5. 优化的首屏加载时间
