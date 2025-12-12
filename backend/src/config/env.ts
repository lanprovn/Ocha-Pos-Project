import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file với path rõ ràng để đảm bảo tìm thấy file
// Thử load từ thư mục backend (nơi chạy server)
const envPath = path.resolve(process.cwd(), '.env');
const result = dotenv.config({ path: envPath });

// Nếu không tìm thấy, thử load mặc định (dotenv sẽ tự tìm trong thư mục gốc)
if (result.error) {
  dotenv.config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return '8080';
      return val || '8080';
    },
    z.string().default('8080')
  ),
  DATABASE_URL: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') {
        throw new Error('DATABASE_URL is required and cannot be empty');
      }
      return val;
    },
    z.string().min(1, 'DATABASE_URL is required')
  ),
  JWT_SECRET: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') {
        throw new Error('JWT_SECRET is required and cannot be empty');
      }
      return val;
    },
    z.string().min(32, 'JWT_SECRET must be at least 32 characters')
  ),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  BACKEND_URL: z.string().default('http://localhost:8080'),
  // Logging - handle empty string by converting to default
  LOG_LEVEL: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim() === '') return 'info';
      return val;
    },
    z.enum(['error', 'warn', 'info', 'debug']).default('info')
  ),
  // Bank QR Code Configuration
  BANK_CODE: z.string().optional(),
  BANK_ACCOUNT_NUMBER: z.string().optional(),
  BANK_ACCOUNT_NAME: z.string().optional(),
  QR_TEMPLATE: z.enum(['print', 'compact2', 'compact', 'qr_only']).default('print'),
  // Cloudinary Configuration (optional - if not provided, will use local storage)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const env = envSchema.parse(process.env);

export default env;

