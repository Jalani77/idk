import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  cookieSecret: process.env.COOKIE_SECRET || 'yiriai_dev_secret_change_me',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  dbPath: process.env.DB_PATH || './data/yiriai.db'
};
