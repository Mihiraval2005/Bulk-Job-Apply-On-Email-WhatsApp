import { executeQuery } from '../../config/db.js';

export const getTemplatesByUser = async (userId) => {
  const result = await executeQuery(
    'SELECT * FROM t_templates WHERE userid = $1 ORDER BY createdat DESC',
    [userId],
  );
  return result.rows;
};

export const saveTemplate = async (data) => {
  const result = await executeQuery(`
    INSERT INTO t_templates (
      templateid, userid, name, channel, tone, subjecttemplate, bodytemplate, isdefault, createdat, updatedat
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    RETURNING *
  `, [
    data.templateId,
    data.userId,
    data.name,
    data.channel,
    data.tone || 'formal',
    data.subjectTemplate || null,
    data.bodyTemplate,
    data.isDefault || false,
  ]);
  return result.rows[0];
};

export const deleteTemplate = async (templateId, userId) => {
  await executeQuery(
    'DELETE FROM t_templates WHERE templateid = $1 AND userid = $2',
    [templateId, userId],
  );
};
