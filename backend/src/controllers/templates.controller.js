import { v4 as uuidv4 } from 'uuid';
import * as templateRepo from '../db/repositories/template.repository.js';
import { success } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getTemplates = asyncHandler(async (req, res) => {
  const templates = await templateRepo.getTemplatesByUser(req.user.userId);
  return success(res, templates);
});

export const createTemplate = asyncHandler(async (req, res) => {
  const data = { ...req.body, templateId: uuidv4(), userId: req.user.userId };
  const template = await templateRepo.saveTemplate(data);
  return success(res, template, 'Template saved', 201);
});

export const deleteTemplate = asyncHandler(async (req, res) => {
  await templateRepo.deleteTemplate(req.params.id, req.user.userId);
  return success(res, null, 'Template deleted');
});
