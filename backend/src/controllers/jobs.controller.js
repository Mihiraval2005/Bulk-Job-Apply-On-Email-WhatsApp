import * as jobRepo from '../db/repositories/job.repository.js';
import { success } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const bulkInsert = asyncHandler(async (req, res) => {
  const { jobs } = req.body;
  const inserted = await jobRepo.bulkInsertJobs(req.user.userId, jobs);
  return success(res, inserted, `${inserted.length} jobs added`, 201);
});

export const getJobs = asyncHandler(async (req, res) => {
  const jobs = await jobRepo.getJobsByUser(req.user.userId);
  return success(res, jobs);
});
