import multer from 'multer';
import path from 'path';
import env from '../config/env.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, env.UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueName = `${req.user.userId}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  allowed.includes(ext) ? cb(null, true) : cb(new Error('Only PDF and Word documents allowed'), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024 },
});
