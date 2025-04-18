
[MODE: RESEARCH]

我已详细分析了您提供的数据库结构和前端代码。基于这些信息，以下是后端需要实现的功能和API接口。

## 后端需要实现的功能

### 1. 用户管理

```
- POST /api/auth/login - 用户登录
- POST /api/auth/register - 用户注册
- GET /api/auth/profile - 获取用户个人信息
- PUT /api/auth/profile - 更新用户个人信息
- POST /api/auth/logout - 用户登出
```

### 2. 题目管理

```
- GET /api/questions - 获取题目列表(支持分页、筛选)
- GET /api/questions/:id - 获取题目详情
- GET /api/exam-sets - 获取试题集列表
- GET /api/exam-sets/:id - 获取特定试题集详情
- GET /api/exam-sets/:id/questions - 获取试题集中的所有题目
```

### 3. 练习管理

```
- POST /api/practice - 创建新练习记录
- PUT /api/practice/:id - 更新练习记录(如结束练习)
- GET /api/practice/history - 获取用户练习历史
- GET /api/practice/:id - 获取特定练习详情
```

### 4. 答题记录

```
- POST /api/answer-records - 提交题目答案
- GET /api/answer-records - 获取用户答题记录
- GET /api/answer-records/stats - 获取用户答题统计数据
```

### 5. 错题本管理

```
- GET /api/wrong-questions - 获取用户错题列表
- GET /api/wrong-questions/:id - 获取错题详情
- POST /api/wrong-questions - 添加题目到错题本
- PUT /api/wrong-questions/:id - 更新错题状态或笔记
- DELETE /api/wrong-questions/:id - 从错题本中删除题目
```

### 6. 收藏夹管理

```
- GET /api/favorites - 获取用户收藏的题目
- POST /api/favorites - 添加题目到收藏夹
- DELETE /api/favorites/:id - 取消收藏题目
```

### 7. 数据分析和统计

```
- GET /api/analytics/overview - 获取学习概览数据
- GET /api/analytics/progress - 获取学习进度数据
- GET /api/analytics/knowledge-points - 获取知识点掌握度数据
- GET /api/analytics/question-types - 获取题型分布数据
```

## 详细API功能说明

### 用户管理API详情

1. **登录接口** - 验证用户凭据并返回身份验证令牌
   ```
   输入: { username, password }
   输出: { token, user_info }
   ```

2. **注册接口** - 创建新用户账户
   ```
   输入: { username, email, password }
   输出: { success, message, user_id }
   ```

3. **获取用户信息** - 返回当前登录用户的个人信息
   ```
   输入: Authorization头
   输出: { user_info, stats }
   ```

### 题目相关API详情

1. **获取题目列表** - 支持各种筛选条件和分页
   ```
   输入: { page, limit, filters(类型、难度、知识点) }
   输出: { total, questions[] }
   ```

2. **获取试题集列表** - 返回所有可用的试题集
   ```
   输入: { page, limit, year? }
   输出: { total, exam_sets[] }
   ```

### 练习相关API详情

1. **创建练习记录** - 开始新的练习会话
   ```
   输入: { exam_set_id?, question_ids?, time_limit? }
   输出: { practice_id, start_time, questions[] }
   ```

2. **提交答案** - 记录用户对题目的回答
   ```
   输入: { practice_id, question_id, user_answer, time_spent }
   输出: { is_correct, correct_answer, explanation }
   ```

### 错题本API详情

1. **获取错题列表** - 获取用户的所有错题
   ```
   输入: { filters(状态、知识点), sort_by }
   输出: { total, wrong_questions[] }
   ```

2. **更新错题状态** - 更新错题的复习状态
   ```
   输入: { status('new'|'reviewing'|'mastered') }
   输出: { success, updated_wrong_question }
   ```

## 数据模型和关系

后端需要处理以下数据表之间的关系:

1. 用户(users)与练习记录(practice_records)：一对多
2. 练习记录(practice_records)与答题记录(answer_records)：一对多
3. 题目(questions)与选项(options)：一对多
4. 用户(users)与错题(wrong_questions)：一对多
5. 用户(users)与收藏(user_favorites)：一对多

## 认证和权限

后端需要实现:
1. JWT或其他令牌认证机制
2. 用户权限验证
3. API访问控制

## 数据处理和业务逻辑

1. 用户答题正确率计算
2. 知识点掌握度分析
3. 学习数据统计
4. 错题自动收集逻辑
5. 复习计划生成

以上功能可以基于您现有的数据库结构和前端代码实现，无需修改现有代码。后端可以使用Node.js(Express/Koa)、Java(Spring Boot)、Python(Django/Flask)或PHP(Laravel)等技术栈实现。
