import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller.js';
import { registerRules, loginRules } from '../validators/auth.validator.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', registerRules, validate, register);
router.post('/login',    loginRules,    validate, login);
router.get('/me',        authenticate,  me);

export default router;
