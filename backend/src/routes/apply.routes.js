import { Router } from 'express';
import { bulkApply, getApplications, getStats, retryApplication } from '../controllers/apply.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.post('/bulk',        authenticate, bulkApply);
router.get('/',             authenticate, getApplications);
router.get('/stats',        authenticate, getStats);
router.patch('/:id/retry',  authenticate, retryApplication);

export default router;
