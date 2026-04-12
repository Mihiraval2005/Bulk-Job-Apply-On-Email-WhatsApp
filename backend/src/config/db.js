import sql from 'mssql';
import env from './env.js';
import logger from '../utils/logger.js';

const dbConfig = {
  server:   env.DB_SERVER,
  database: env.DB_DATABASE,
  user:     env.DB_USER,
  password: env.DB_PASSWORD,
  port:     env.DB_PORT,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

export const getPool = async () => {
  if (pool) return pool;
  pool = await sql.connect(dbConfig);
  logger.info('SQL Server connected');
  return pool;
};

export const executeProc = async (procName, params = {}) => {
  const db = await getPool();
  const request = db.request();
  Object.entries(params).forEach(([key, { type, value }]) => {
    request.input(key, type, value);
  });
  return request.execute(procName);
};

export const executeQuery = async (query, params = {}) => {
  const db = await getPool();
  const request = db.request();
  Object.entries(params).forEach(([key, { type, value }]) => {
    request.input(key, type, value);
  });
  return request.query(query);
};

export { sql };
