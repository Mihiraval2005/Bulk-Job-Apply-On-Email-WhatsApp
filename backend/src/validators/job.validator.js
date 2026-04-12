import { body } from 'express-validator';

export const bulkJobRules = [
  body('jobs').isArray({ min: 1 }).withMessage('Jobs array required'),
  body('jobs.*.companyName').trim().notEmpty().withMessage('Company name required'),
  body('jobs.*.jobTitle').trim().notEmpty().withMessage('Job title required'),
  body('jobs.*.channel').isIn([1, 2, 3]).withMessage('Channel must be 1=Email 2=WhatsApp 3=Both'),
];
