const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  PORT: process.env.PORT || 5001,
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'scout-super-secret-jwt-key-2026-development-change-in-prod',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@scout.app',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin12345',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  RAPIDAPI_KEY: process.env.RAPIDAPI_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
};

module.exports = env;
