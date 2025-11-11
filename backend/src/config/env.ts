import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('8080'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  BACKEND_URL: z.string().default('http://localhost:8080'),
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  // Bank QR Code Configuration
  BANK_CODE: z.string().optional(),
  BANK_ACCOUNT_NUMBER: z.string().optional(),
  BANK_ACCOUNT_NAME: z.string().optional(),
  QR_TEMPLATE: z.enum(['print', 'compact2', 'compact', 'qr_only']).default('print'),
});

const env = envSchema.parse(process.env);

export default env;

