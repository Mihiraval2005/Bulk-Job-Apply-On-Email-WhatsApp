import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack, path: req.path, method: req.method });

  if (err.code === 'ECONNREFUSED')
    return res.status(503).json({ success: false, message: 'Database unavailable' });

  if (err.name === 'JsonWebTokenError')
    return res.status(401).json({ success: false, message: 'Invalid token' });

  if (err.code === 'LIMIT_FILE_SIZE')
    return res.status(400).json({ success: false, message: 'File too large' });

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({ success: false, message: err.message || 'Internal Server Error' });
};

export const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};
