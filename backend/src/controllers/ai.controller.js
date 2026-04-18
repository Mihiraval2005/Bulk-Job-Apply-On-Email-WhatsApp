import * as aiService from '../services/ai.service.js';
import { success, error } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const parseResume = asyncHandler(async (req, res) => {
  if (!req.file) return error(res, 'Resume file required', 400);
  const parsed = await aiService.parseResume(req.file.path);
  return success(res, parsed, 'Resume parsed');
});

export const generateContent = asyncHandler(async (req, res) => {
  const { jobs, tone = 'formal', resumeProfile } = req.body;
  console.log('=== GENERATE jobs[0] ===', JSON.stringify(jobs[0])); // add karo
  if (!jobs || !jobs.length) return error(res, 'Jobs array required', 400);
  const results = await aiService.generateBulkContent(jobs, resumeProfile, tone);
  return success(res, results, 'Content generated');
});