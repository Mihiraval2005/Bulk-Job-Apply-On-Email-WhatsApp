import app from './app.js';
import env from './src/config/env.js';
import { getPool } from './src/config/db.js';
import logger from './src/utils/logger.js';
import fs from 'fs';

if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

try {
  await getPool();
  app.listen(env.PORT, () => {
    logger.info(`BulkApply API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
} catch (err) {
  logger.error('Failed to start server', { error: err.message });
  process.exit(1);
}
