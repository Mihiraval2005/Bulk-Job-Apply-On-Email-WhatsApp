import * as jobRepo from '../db/repositories/job.repository.js';
import { success } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const bulkInsert = asyncHandler(async (req, res) => {
  const { jobs } = req.body;
  const inserted = await jobRepo.bulkInsertJobs(req.user.userId, jobs);
  
  // SQL Server PascalCase → camelCase normalize karo
  const normalized = inserted.map((j) => ({
    jobId:        j.JobId,
    companyName:  j.CompanyName,
    jobTitle:     j.JobTitle,
    contactEmail: j.ContactEmail,
    contactPhone: j.ContactPhone,
    channel:      j.Channel,
    createdAt:    j.CreatedAt,
  }));

  return success(res, normalized, `${normalized.length} jobs added`, 201);
});

export const getJobs = asyncHandler(async (req, res) => {
  const jobs = await jobRepo.getJobsByUser(req.user.userId);
  return success(res, jobs);
});
