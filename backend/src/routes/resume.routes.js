import { Router } from 'express';
import { uploadResume } from '../controllers/resume.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();
router.post('/', authenticate, upload.single('resume'), uploadResume);

export default router;
