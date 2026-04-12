import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './src/config/env.js';
import { errorHandler, notFound } from './src/middleware/error.middleware.js';
import logger from './src/utils/logger.js';

import authRoutes      from './src/routes/auth.routes.js';
import resumeRoutes    from './src/routes/resume.routes.js';
import jobsRoutes      from './src/routes/jobs.routes.js';
import aiRoutes        from './src/routes/ai.routes.js';
import applyRoutes     from './src/routes/apply.routes.js';
import templatesRoutes from './src/routes/templates.routes.js';

// __dirname not available in ESM — use this instead
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan('dev', { stream: { write: (msg) => logger.http(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => res.json({ status: 'ok', env: env.NODE_ENV }));

app.use('/api/auth',      authRoutes);
app.use('/api/resume',    resumeRoutes);
app.use('/api/jobs',      jobsRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api/apply',     applyRoutes);
app.use('/api/templates', templatesRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;