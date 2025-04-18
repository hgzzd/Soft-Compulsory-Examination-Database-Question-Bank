import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 数据库连接配置
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'topic_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建数据库连接池
const pool = mysql.createPool(poolConfig);

// 测试数据库连接
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('数据库连接成功');
    console.log(`已连接到: ${poolConfig.host}/${poolConfig.database}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    console.error(`尝试连接: ${poolConfig.host}/${poolConfig.database}失败`);
    
    // 显示更详细的错误信息
    if (error instanceof Error) {
      console.error(`错误类型: ${error.name}`);
      console.error(`错误信息: ${error.message}`);
      if ('code' in error) {
        console.error(`错误代码: ${(error as any).code}`);
      }
      if ('errno' in error) {
        console.error(`错误号: ${(error as any).errno}`);
      }
      if ('sqlState' in error) {
        console.error(`SQL状态: ${(error as any).sqlState}`);
      }
      if ('sqlMessage' in error) {
        console.error(`SQL消息: ${(error as any).sqlMessage}`);
      }
    }
    
    return false;
  }
};

export { pool, testConnection, poolConfig }; 