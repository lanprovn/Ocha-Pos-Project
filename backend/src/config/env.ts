import { z } from 'zod';
import dotenv from 'dotenv';

// Log immediately to ensure output is visible
process.stdout.write('Loading environment variables...\n');
if (process.stdout.flush) process.stdout.flush();

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

let env: z.infer<typeof envSchema>;

try {
  process.stdout.write('Validating environment variables...\n');
  if (process.stdout.flush) process.stdout.flush();
  env = envSchema.parse(process.env);
  process.stdout.write('✅ Environment variables validated successfully\n');
  if (process.stdout.flush) process.stdout.flush();
} catch (error: any) {
  // Log to console directly (logger might not be initialized yet)
  // Use process.stderr to ensure error output is visible
  process.stderr.write('❌ Environment validation failed:\n');
  if (process.stderr.flush) process.stderr.flush();
  if (error.errors) {
    error.errors.forEach((err: any) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  } else {
    console.error(`  ${error.message}`);
  }
  console.error('\n📋 Required environment variables:');
  console.error('  - DATABASE_URL (required)');
  console.error('  - JWT_SECRET (required, min 32 characters)');
  console.error('\n📋 Optional environment variables:');
  console.error('  - NODE_ENV (default: development)');
  console.error('  - PORT (default: 8080)');
  console.error('  - FRONTEND_URL (default: http://localhost:5173)');
  console.error('  - BACKEND_URL (default: http://localhost:8080)');
  console.error('  - LOG_LEVEL (default: info)');
  process.exit(1);
}

export default env;

