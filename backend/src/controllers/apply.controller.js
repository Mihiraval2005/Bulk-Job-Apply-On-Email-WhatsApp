import * as queueService from '../services/queue.service.js';
import * as appRepo from '../db/repositories/application.repository.js';
import { success, error } from '../utils/response.js';
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
  const { id } = req.params;

  // Check application exists and belongs to user
  const app = await appRepo.getApplicationById(id, req.user.userId);
  if (!app) return error(res, 'Application not found', 404);

  // Only retry failed applications
  const status = app.Status ?? app.status;
  if (status !== 2) return error(res, 'Only failed applications can be retried', 400);

  await queueService.retryOne(id, req.user.userId);
  return success(res, null, 'Retry queued');
});