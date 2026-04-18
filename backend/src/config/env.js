import 'dotenv/config';

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,

  DB_SERVER: process.env.DB_SERVER || 'localhost',
  DB_DATABASE: process.env.DB_DATABASE || 'BulkApply',
  DB_USER: process.env.DB_USER || 'sa',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_PORT: parseInt(process.env.DB_PORT) || 1433,

  JWT_SECRET: process.env.JWT_SECRET || 'changeme_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // AI
 GROQ_API_KEY: process.env.GROQ_API_KEY || '',

  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM_NAME: process.env.SMTP_FROM_NAME || 'BulkApply',

  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_WA_FROM: process.env.TWILIO_WA_FROM || 'whatsapp:+14155238886',

  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB) || 5,

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
};

if (env.NODE_ENV === 'production') {
  const required = ['JWT_SECRET', 'DB_PASSWORD', 'ANTHROPIC_API_KEY', 'SMTP_USER', 'SMTP_PASS'];
  required.forEach((key) => {
    if (!env[key]) throw new Error(`Missing required env var: ${key}`);
  });
}

export default env;
