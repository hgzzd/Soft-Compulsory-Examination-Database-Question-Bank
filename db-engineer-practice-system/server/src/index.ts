import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, poolConfig } from './config/database';
import { initDatabase } from './utils/db.utils';
import routes from './routes';

// 加载环境变量
dotenv.config();

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 初始化应用
const initialize = async () => {
  try {
    // 显示数据库连接信息
    console.log('==================================');
    console.log('       软考数据库练习系统');
    console.log('==================================');
    console.log(`尝试连接数据库: ${poolConfig.host}/${poolConfig.database}...`);
    
    // 测试数据库连接
    const connected = await testConnection();
    if (!connected) {
      console.error('无法连接到数据库，应用程序退出');
      process.exit(1);
    }

    try {
      // 初始化/检查数据库表结构
      await initDatabase();
    } catch (dbError) {
      console.error('数据库检查出错，但将继续启动应用程序:', dbError);
      console.log('请确保数据库表结构已正确设置');
    }

    // 路由配置
    app.use(routes);

    // API状态检查路由
    app.get('/api/status', (req, res) => {
      res.status(200).json({
        status: 'online',
        version: '1.0.0',
        dbConnection: 'connected'
      });
    });

    // 404处理
    app.use((req: Request, res: Response) => {
      res.status(404).json({ message: '找不到请求的资源' });
    });

    // 全局错误处理
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('全局错误捕获:', err);
      res.status(500).json({
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    // 启动服务器
    app.listen(PORT, () => {
      console.log('==================================');
      console.log(`服务器运行在 http://localhost:${PORT}`);
      console.log(`API接口路径: http://localhost:${PORT}/api`);
      console.log(`API状态检查: http://localhost:${PORT}/api/status`);
      console.log('按 Ctrl+C 停止服务器');
      console.log('==================================');
    });
  } catch (error) {
    console.error('初始化应用失败:', error);
    process.exit(1);
  }
};

// 设置未捕获的异常处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  console.log('程序将继续运行，但请检查错误');
});

// 设置未处理的Promise拒绝处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  console.log('程序将继续运行，但请检查错误');
});

// 启动应用
initialize(); 