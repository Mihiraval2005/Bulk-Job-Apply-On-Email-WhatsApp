import { executeProc, sql } from '../../config/db.js';

export const getTemplatesByUser = async (userId) => {
  const result = await executeProc('SP_Templates_GetList', {
    UserId: { type: sql.UniqueIdentifier, value: userId },
  });
  return result.recordset;
};

export const saveTemplate = async (data) => {
  const result = await executeProc('SP_Templates_Insert', {
    TemplateId:      { type: sql.UniqueIdentifier,  value: data.templateId },
    UserId:          { type: sql.UniqueIdentifier,  value: data.userId },
    Name:            { type: sql.NVarChar(255),     value: data.name },
    Channel:         { type: sql.TinyInt,           value: data.channel },
    Tone:            { type: sql.NVarChar(20),      value: data.tone || 'formal' },
    SubjectTemplate: { type: sql.NVarChar(512),     value: data.subjectTemplate || null },
    BodyTemplate:    { type: sql.NVarChar(sql.MAX), value: data.bodyTemplate },
    IsDefault:       { type: sql.Bit,               value: data.isDefault || false },
  });
  return result.recordset[0];
};

export const deleteTemplate = async (templateId, userId) => {
  await executeProc('SP_Templates_Delete', {
    TemplateId: { type: sql.UniqueIdentifier, value: templateId },
    UserId:     { type: sql.UniqueIdentifier, value: userId },
  });
};
