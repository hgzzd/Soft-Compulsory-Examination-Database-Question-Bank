# 数据库工程师在线练习系统 - 后端

本项目是数据库工程师在线练习系统的后端部分，提供了用户认证、题目管理、练习管理、答题记录、错题本、收藏夹以及数据分析等API接口。

## 技术栈

- Node.js
- Express.js
- TypeScript
- MySQL
- JWT 认证
- bcrypt 密码加密

## 项目结构

```
server/
├── src/
│   ├── config/           # 配置文件
│   │   └── database.ts   # 数据库配置
│   ├── controllers/      # 控制器，处理请求和响应
│   ├── middleware/       # 中间件
│   │   └── auth.middleware.ts  # 身份验证中间件
│   ├── models/           # 数据模型，与数据库交互
│   ├── routes/           # 路由定义
│   ├── utils/            # 工具函数
│   │   ├── auth.utils.ts # 认证工具函数
│   │   └── db.utils.ts   # 数据库工具函数
│   └── index.ts          # 应用入口
├── .env                  # 环境变量
├── package.json          # 依赖配置
└── tsconfig.json         # TypeScript 配置
```

## API 接口

### 用户认证

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户个人信息
- `PUT /api/auth/profile` - 更新用户个人信息
- `POST /api/auth/logout` - 用户登出

### 题目管理

- `GET /api/questions` - 获取题目列表(支持分页、筛选)
- `GET /api/questions/:id` - 获取题目详情
- `GET /api/exam-sets` - 获取试题集列表
- `GET /api/exam-sets/:id` - 获取特定试题集详情
- `GET /api/exam-sets/:id/questions` - 获取试题集中的所有题目

### 练习管理

- `POST /api/practice` - 创建新练习记录
- `PUT /api/practice/:id` - 更新练习记录(如结束练习)
- `GET /api/practice/history` - 获取用户练习历史
- `GET /api/practice/:id` - 获取特定练习详情

### 答题记录

- `POST /api/answer-records` - 提交题目答案
- `GET /api/answer-records` - 获取用户答题记录
- `GET /api/answer-records/stats` - 获取用户答题统计数据

### 错题本管理

- `GET /api/wrong-questions` - 获取用户错题列表
- `GET /api/wrong-questions/:id` - 获取错题详情
- `POST /api/wrong-questions` - 添加题目到错题本
- `PUT /api/wrong-questions/:id` - 更新错题状态或笔记
- `DELETE /api/wrong-questions/:id` - 从错题本中删除题目

### 收藏夹管理

- `GET /api/favorites` - 获取用户收藏的题目
- `POST /api/favorites` - 添加题目到收藏夹
- `DELETE /api/favorites/:id` - 取消收藏题目

### 数据分析和统计

- `GET /api/analytics/overview` - 获取学习概览数据
- `GET /api/analytics/progress` - 获取学习进度数据
- `GET /api/analytics/knowledge-points` - 获取知识点掌握度数据
- `GET /api/analytics/question-types` - 获取题型分布数据

## 环境变量配置

在项目根目录创建 `.env` 文件，包含以下配置：

```
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=db_engineer_exam

# 服务器配置
PORT=3000
NODE_ENV=development

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# 跨域配置
CORS_ORIGIN=http://localhost:5173
```

## 安装和启动

1. 安装依赖

```bash
npm install
```

2. 开发模式启动

```bash
npm run dev
```

3. 构建生产版本

```bash
npm run build
```

4. 运行生产版本

```bash
npm start
```

## 数据库初始化

应用启动时会自动检测并创建所需的数据库表结构。确保您的MySQL数据库已运行，并且已创建了相应的数据库（默认为`db_engineer_exam`）。

## 认证机制

本系统使用JWT (JSON Web Token) 进行身份验证。除了登录和注册接口外，其他API都需要在请求头中包含有效的`Authorization: Bearer {token}`才能访问。 