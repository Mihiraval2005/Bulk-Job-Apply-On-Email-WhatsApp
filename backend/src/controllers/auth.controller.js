import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import * as userRepo from '../db/repositories/user.repository.js';
import env from '../config/env.js';
import { success, error } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;
  const existing = await userRepo.findByEmail(email);
  if (existing) return error(res, 'Email already registered', 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = uuidv4();
  const user = await userRepo.createUser({ userId, email, passwordHash, fullName });
  const token = jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

  return success(res, { token, user: { userId, email, fullName } }, 'Registered successfully', 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await userRepo.findByEmail(email);
  if (!user) return error(res, 'Invalid credentials', 401);

  const isMatch = await bcrypt.compare(password, user.passwordhash);
  if (!isMatch) return error(res, 'Invalid credentials', 401);

  const token = jwt.sign({ userId: user.userid, email: user.email }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  return success(res, {
    token,
    user: { userId: user.userid, email: user.email, fullName: user.fullname, resumeUrl: user.resumeurl },
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await userRepo.findByEmail(req.user.email);
  if (!user) return error(res, 'User not found', 404);
  return success(res, { userId: user.userid, email: user.email, fullName: user.fullname, resumeUrl: user.resumeurl });
});
