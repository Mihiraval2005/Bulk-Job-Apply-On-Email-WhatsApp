import { executeProc, sql } from '../../config/db.js';

export const bulkInsertJobs = async (userId, jobs) => {
  const table = new sql.Table();
  table.columns.add('CompanyName',    sql.NVarChar(255));
  table.columns.add('JobTitle',       sql.NVarChar(255));
  table.columns.add('JobDescription', sql.NVarChar(sql.MAX));
  table.columns.add('ContactEmail',   sql.NVarChar(255));
  table.columns.add('ContactPhone',   sql.NVarChar(20));
  table.columns.add('Channel',        sql.TinyInt);

  jobs.forEach((j) => {
    table.rows.add(j.companyName, j.jobTitle, j.jobDescription, j.contactEmail || null, j.contactPhone || null, j.channel);
  });

  const result = await executeProc('SP_Jobs_BulkInsert', {
    UserId: { type: sql.UniqueIdentifier, value: userId },
    Jobs:   { type: sql.TVP,              value: table },
  });
  return result.recordset;
};

export const getJobsByUser = async (userId) => {
  const result = await executeProc('SP_Jobs_GetByUser', {
    UserId: { type: sql.UniqueIdentifier, value: userId },
  });
  return result.recordset;
};
