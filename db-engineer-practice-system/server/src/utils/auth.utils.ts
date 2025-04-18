import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS = 10;

// 定义Token负载接口
interface TokenPayload {
  id: number;
  username: string;
  [key: string]: any;
}

/**
 * 生成JWT令牌
 * @param payload 载荷数据
 * @returns JWT令牌
 */
export const generateToken = (payload: TokenPayload): string => {
  // 显式类型转换解决JWT签名函数类型问题
  const secret = JWT_SECRET as jwt.Secret;
  const options = { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions;
  
  return jwt.sign(payload, secret, options);
};

/**
 * 验证JWT令牌
 * @param token JWT令牌
 * @returns 解码后的载荷或null
 */
export const verifyToken = (token: string): any => {
  try {
    const secret = JWT_SECRET as jwt.Secret;
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

/**
 * 加密密码
 * @param password 明文密码
 * @returns 加密后的密码
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * 验证密码
 * @param password 明文密码
 * @param hashedPassword 加密后的密码
 * @returns 是否匹配
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
}; 