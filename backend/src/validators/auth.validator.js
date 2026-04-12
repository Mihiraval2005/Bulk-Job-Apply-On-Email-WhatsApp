import { body } from 'express-validator';

export const registerRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('fullName').trim().notEmpty().withMessage('Full name required'),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password required'),
];
