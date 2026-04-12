import { executeProc, sql } from '../../config/db.js';

export const upsertApplication = async (data) => {
  const result = await executeProc('SP_Applications_Upsert', {
    ApplicationId: { type: sql.UniqueIdentifier,  value: data.applicationId },
    JobId:         { type: sql.UniqueIdentifier,  value: data.jobId },
    UserId:        { type: sql.UniqueIdentifier,  value: data.userId },
    Channel:       { type: sql.TinyInt,           value: data.channel },
    Status:        { type: sql.TinyInt,           value: data.status },
    EmailSubject:  { type: sql.NVarChar(512),     value: data.emailSubject  || null },
    EmailBody:     { type: sql.NVarChar(sql.MAX), value: data.emailBody     || null },
    WhatsAppMsg:   { type: sql.NVarChar(sql.MAX), value: data.whatsAppMsg   || null },
    ErrorMsg:      { type: sql.NVarChar(sql.MAX), value: data.errorMsg      || null },
  });
  return result.recordset[0];
};

export const getApplicationsByUser = async (userId) => {
  const result = await executeProc('SP_Applications_GetList', {
    UserId: { type: sql.UniqueIdentifier, value: userId },
  });
  return result.recordset;
};

export const getStats = async (userId) => {
  const result = await executeProc('SP_Applications_GetStats', {
    UserId: { type: sql.UniqueIdentifier, value: userId },
  });
  return result.recordset[0];
};
