import 'dotenv/config';

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,

   
  DB_URL: process.env.DIRECT_URL || process.env.DATABASE_URL ||  '',
  DB_SSL: process.env.DB_SSL || 'false',

  JWT_SECRET: process.env.JWT_SECRET || 'changeme_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // AI
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',

  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'BulkApply',

 

  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 5,

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
};

if (env.NODE_ENV === 'production') {
  const required = ['JWT_SECRET', 'GROQ_API_KEY', 'SMTP_USER', 'SMTP_PASS'];
  required.forEach((key) => {
    if (!env[key]) throw new Error(`Missing required env var: ${key}`);
  });
}

export default env;
