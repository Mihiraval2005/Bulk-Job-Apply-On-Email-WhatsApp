import pg from 'pg';
import env from './env.js';
import logger from '../utils/logger.js';

const { Pool } = pg;

const connectionString = env.DB_URL || `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;

const poolConfig = {
  connectionString,
  ssl: env.DB_SSL === 'true' || env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  max: 10,
  min: 1,
  idleTimeoutMillis: 10000,        // Disconnect idle connections before Neon's 5min timeout
  connectionTimeoutMillis: 5000,   // Timeout for acquiring connection from pool
  keepAlives: true,                // Enable TCP keep-alive
  keepAlivesIdleTimeout: 30000,    // Send keep-alive every 30 seconds
  statement_timeout: 30000,        // Statement timeout
  query_timeout: 30000,            // Query timeout
};

let pool = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY = 5000;

export const getPool = async () => {
  if (!pool) {
    pool = new Pool(poolConfig);
    
    pool.on('error', (err) => {
      logger.error('PostgreSQL pool error', { 
        message: err.message,
        code: err.code,
        severity: err.severity 
      });
      
      // Recreate pool on connection errors
      if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        pool = null;
      }
    });

    pool.on('connect', () => {
      reconnectAttempts = 0;
      logger.info('PostgreSQL pool connection established');
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
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const db = await getPool();
      const result = await db.query(query, normalizeParams(params));
      return result;
    } catch (error) {
      attempts++;
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('terminator') || error.message.includes('Connection terminated')) {
        logger.warn(`Query attempt ${attempts}/${maxAttempts} failed, retrying...`, { 
          error: error.message,
          code: error.code 
        });
        
        // Reset pool to force reconnection
        pool = null;
        
        if (attempts < maxAttempts) {
          // Exponential backoff
          await new Promise(r => setTimeout(r, RECONNECT_DELAY * attempts));
          continue;
        }
      }
      
      // If not a recoverable connection error, throw immediately
      throw error;
    }
  }

  throw new Error('Failed to execute query after retries');
};

export const executeProc = async (procName, params = {}) => {
  const values = normalizeParams(params);
  const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
  return executeQuery(`SELECT * FROM ${procName}(${placeholders})`, values);
};

export { Pool as pg };
