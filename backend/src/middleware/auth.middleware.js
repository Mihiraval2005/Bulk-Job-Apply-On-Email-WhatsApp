import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { error } from '../utils/response.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'No token provided', 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, 'Invalid or expired token', 401);
  }
};
