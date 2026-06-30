import * as jobRepo from '../db/repositories/job.repository.js';
import { success } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const bulkInsert = asyncHandler(async (req, res) => {
  const { jobs } = req.body;
  const inserted = await jobRepo.bulkInsertJobs(req.user.userId, jobs);
  
  const normalized = inserted.map((j) => ({
    jobId:         j.jobid ?? j.JobId ?? j.JobId ?? j.id,
    companyName:   j.companyname ?? j.CompanyName,
    jobTitle:      j.jobtitle ?? j.JobTitle,
    jobDescription:j.jobdescription ?? j.JobDescription ?? null,
    requiredSkills:j.requiredskills ?? j.RequiredSkills ?? null,
    contactEmail:  j.contactemail ?? j.ContactEmail ?? '',
    contactPhone:  j.contactphone ?? j.ContactPhone ?? '',
    channel:       j.channel ?? j.Channel,
    createdAt:     j.createdat ?? j.CreatedAt,
  }));

  return success(res, normalized, `${normalized.length} jobs added`, 201);
});

export const getJobs = asyncHandler(async (req, res) => {
  const jobs = await jobRepo.getJobsByUser(req.user.userId);
  return success(res, jobs);
});
