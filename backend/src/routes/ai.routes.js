import { Router } from 'express';
import { parseResume, generateContent } from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = Router();
router.post('/parse-resume',     authenticate, upload.single('resume'), parseResume);
router.post('/generate-content', authenticate, generateContent);

export default router;
