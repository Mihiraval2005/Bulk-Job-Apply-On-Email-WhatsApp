import * as userRepo from '../db/repositories/user.repository.js';
import { success, error } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) return error(res, 'No file uploaded', 400);
  const resumeUrl = `/uploads/${req.file.filename}`;
  await userRepo.updateResume(req.user.userId, resumeUrl);
  return success(res, { resumeUrl }, 'Resume uploaded successfully');
});
