import { pool } from '../config/database';

/**
 * 检查数据库表是否已存在
 * @param tableName 表名
 * @returns 表是否存在
 */
export const isTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
      [process.env.DB_NAME, tableName]
    );
    
    const result = rows as any[];
    return result[0].count > 0;
  } catch (error) {
    console.error(`检查表 ${tableName} 是否存在失败:`, error);
    return false;
  }
};

/**
 * 检查必要的数据库表是否都存在
 */
export const checkRequiredTables = async (): Promise<boolean> => {
  try {
    const requiredTables = [
      'users',
      'questions',
      'options',
      'exam_sets',
      'practice_records',
      'answer_records',
      'wrong_questions',
      'user_favorites'
    ];
    
    let allTablesExist = true;
    const missingTables = [];
    
    for (const table of requiredTables) {
      const exists = await isTableExists(table);
      if (!exists) {
        allTablesExist = false;
        missingTables.push(table);
      }
    }
    
    if (!allTablesExist) {
      console.warn('警告: 以下必要的表不存在:', missingTables.join(', '));
      console.warn('数据库可能未正确初始化，部分功能可能无法使用');
    } else {
      console.log('所有必要的数据库表都已存在');
    }
    
    return allTablesExist;
  } catch (error) {
    console.error('检查必要表是否存在失败:', error);
    return false;
  }
};

/**
 * 初始化数据库表结构
 * 注意：此功能已被禁用，假设数据库表结构已通过外部方式创建
 */
export const initDatabase = async (): Promise<void> => {
  console.log('检查数据库表是否存在...');
  await checkRequiredTables();
  console.log('跳过数据库表创建步骤 - 使用现有数据库结构');
}; 