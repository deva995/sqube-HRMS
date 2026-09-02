import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// In production, enforce that secure secrets are provided in the environment
const jwtSecret = process.env.JWT_SECRET || (isProduction ? '' : 'sqbe_hrms_super_secure_access_token_jwt_secret_key_2026');
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || (isProduction ? '' : 'sqbe_hrms_super_secure_refresh_token_jwt_secret_key_2026');

if (isProduction && (!jwtSecret || !jwtRefreshSecret || !process.env.DATABASE_URL)) {
  const missing = [];
  if (!jwtSecret) missing.push('JWT_SECRET');
  if (!jwtRefreshSecret) missing.push('JWT_REFRESH_SECRET');
  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
  throw new Error(`FATAL: Mandatory production environment variables missing: ${missing.join(', ')}`);
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  jwt: {
    secret: jwtSecret || 'sqbe_hrms_super_secure_access_token_jwt_secret_key_2026',
    refreshSecret: jwtRefreshSecret || 'sqbe_hrms_super_secure_refresh_token_jwt_secret_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  databaseUrl: process.env.DATABASE_URL || '',
  storage: {
    endpoint: process.env.STORAGE_ENDPOINT || 'https://storage.sqbehrms.internal',
    bucket: process.env.STORAGE_BUCKET || 'sqbe-hrms-documents',
    keyId: process.env.STORAGE_KEY_ID || 'demo_key_id',
    secretKey: process.env.STORAGE_SECRET_KEY || 'demo_secret_key',
    signedUrlExpiresIn: parseInt(process.env.STORAGE_SIGNED_URL_EXPIRES_IN || '900', 10), // 15 mins
  },
};
