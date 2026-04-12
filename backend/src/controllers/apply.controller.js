import * as queueService from '../services/queue.service.js';
import * as appRepo from '../db/repositories/application.repository.js';
import { success } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const bulkApply = asyncHandler(async (req, res) => {
  const { applications } = req.body;
  const queued = await queueService.enqueueBulk(req.user.userId, applications);
  return success(res, { queued }, `${queued} applications queued`);
});

export const getApplications = asyncHandler(async (req, res) => {
  const apps = await appRepo.getApplicationsByUser(req.user.userId);
  return success(res, apps);
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await appRepo.getStats(req.user.userId);
  return success(res, stats);
});

export const retryApplication = asyncHandler(async (req, res) => {
  await queueService.retryOne(req.params.id, req.user.userId);
  return success(res, null, 'Retry queued');
});
