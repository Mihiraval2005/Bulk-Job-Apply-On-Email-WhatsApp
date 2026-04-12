import { Router } from 'express';
import { bulkInsert, getJobs } from '../controllers/jobs.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { bulkJobRules } from '../validators/job.validator.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();
router.post('/bulk', authenticate, bulkJobRules, validate, bulkInsert);
router.get('/',      authenticate, getJobs);

export default router;
