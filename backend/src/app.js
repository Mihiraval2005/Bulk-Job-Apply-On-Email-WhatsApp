import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './config/env.js';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import logger from './utils/logger.js';
import registerRoutes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(morgan('dev', { stream: { write: (msg) => logger.http(msg.trim()) } }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

  app.get('/health', (req, res) => res.json({ status: 'ok', env: env.NODE_ENV }));

  app.use(registerRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
