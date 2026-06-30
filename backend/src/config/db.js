import pg from 'pg';
import env from './env.js';
import logger from '../utils/logger.js';

const { Pool } = pg;

const connectionString = env.DB_URL || `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;

const poolConfig = {
  connectionString,
  ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
};

let pool = null;

export const getPool = async () => {
  if (!pool) {
    pool = new Pool(poolConfig);
    pool.on('error', (err) => {
      logger.error('Unexpected PostgreSQL pool error', err);
    });
  }

  return pool;
};

const normalizeParams = (params = []) => {
  if (Array.isArray(params)) return params;
  if (!params || typeof params !== 'object') return [];

  return Object.entries(params).map(([, value]) => {
    if (value && typeof value === 'object' && 'value' in value) return value.value;
    return value;
  });
};

export const executeQuery = async (query, params = []) => {
  const db = await getPool();
  return db.query(query, normalizeParams(params));
};

export const executeProc = async (procName, params = {}) => {
  const values = normalizeParams(params);
  const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
  return executeQuery(`SELECT * FROM ${procName}(${placeholders})`, values);
};

export { Pool as pg };
