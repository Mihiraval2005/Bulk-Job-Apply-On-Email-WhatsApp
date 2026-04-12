import { executeProc, sql } from '../../config/db.js';

export const createUser = async ({ userId, email, passwordHash, fullName }) => {
  const result = await executeProc('SP_Users_Insert', {
    UserId:       { type: sql.UniqueIdentifier, value: userId },
    Email:        { type: sql.NVarChar(255),    value: email },
    PasswordHash: { type: sql.NVarChar(512),    value: passwordHash },
    FullName:     { type: sql.NVarChar(255),    value: fullName },
  });
  return result.recordset[0];
};

export const findByEmail = async (email) => {
  const result = await executeProc('SP_Users_GetByEmail', {
    Email: { type: sql.NVarChar(255), value: email },
  });
  return result.recordset[0] || null;
};

export const updateResume = async (userId, resumeUrl) => {
  await executeProc('SP_Users_UpdateResume', {
    UserId:    { type: sql.UniqueIdentifier, value: userId },
    ResumeUrl: { type: sql.NVarChar(1000),   value: resumeUrl },
  });
};

export const updateProfile = async (userId, resumeProfile) => {
  await executeProc('SP_Users_UpdateProfile', {
    UserId:        { type: sql.UniqueIdentifier, value: userId },
    ResumeProfile: { type: sql.NVarChar(sql.MAX), value: resumeProfile },
  });
};
