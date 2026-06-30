import { Router } from 'express';
import authRoutes from './auth.routes.js';
import resumeRoutes from './resume.routes.js';
import jobsRoutes from './jobs.routes.js';
import aiRoutes from './ai.routes.js';
import applyRoutes from './apply.routes.js';
import templatesRoutes from './templates.routes.js';

const router = Router();

router.use('/api/auth', authRoutes);
router.use('/api/resume', resumeRoutes);
router.use('/api/jobs', jobsRoutes);
router.use('/api/ai', aiRoutes);
router.use('/api/apply', applyRoutes);
router.use('/api/templates', templatesRoutes);

export default router;
