import { Router } from 'express';
import { getTemplates, createTemplate, deleteTemplate } from '../controllers/templates.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/',       authenticate, getTemplates);
router.post('/',      authenticate, createTemplate);
router.delete('/:id', authenticate, deleteTemplate);

export default router;
