import { executeQuery } from '../../config/db.js';

export const upsertApplication = async (data) => {
  const result = await executeQuery(`
    INSERT INTO t_applications (
      applicationid, jobid, userid, channel, status, emailsubject, emailbody, whatsappmsg, errormsg, sentat, retrycount, createdat, updatedat
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    ON CONFLICT (applicationid) DO UPDATE SET
      jobid = EXCLUDED.jobid,
      userid = EXCLUDED.userid,
      channel = EXCLUDED.channel,
      status = EXCLUDED.status,
      emailsubject = EXCLUDED.emailsubject,
      emailbody = EXCLUDED.emailbody,
      whatsappmsg = EXCLUDED.whatsappmsg,
      errormsg = EXCLUDED.errormsg,
      sentat = EXCLUDED.sentat,
      retrycount = EXCLUDED.retrycount,
      updatedat = NOW()
    RETURNING *
  `, [
    data.applicationId,
    data.jobId,
    data.userId,
    data.channel,
    data.status,
    data.emailSubject || null,
    data.emailBody || null,
    data.whatsAppMsg || null,
    data.errorMsg || null,
    data.sentAt || null,
    data.retryCount || 0,
  ]);

  return result.rows[0];
};

export const getApplicationsByUser = async (userId) => {
  const result = await executeQuery(
    `SELECT
      a.applicationid,
      a.jobid,
      a.userid,
      a.channel,
      a.status,
      a.emailsubject,
      a.emailbody,
      a.whatsappmsg,
      a.sentat,
      a.errormsg,
      a.retrycount,
      a.createdat,
      a.updatedat,
      j.companyname AS companyname,
      j.jobtitle AS jobtitle,
      CASE a.channel WHEN 1 THEN 'Email' WHEN 2 THEN 'WhatsApp' WHEN 3 THEN 'Both' ELSE 'Unknown' END AS channellabel,
      CASE a.status WHEN 0 THEN 'Pending' WHEN 1 THEN 'Sent' WHEN 2 THEN 'Failed' WHEN 3 THEN 'Opened' ELSE 'Unknown' END AS statuslabel
    FROM t_applications a
    LEFT JOIN t_jobs j ON a.jobid = j.jobid
    WHERE a.userid = $1
    ORDER BY a.createdat DESC`,
    [userId],
  );
  return result.rows;
};

export const getStats = async (userId) => {
  const result = await executeQuery(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status = 1)::int AS sent,
      COUNT(*) FILTER (WHERE status = 2)::int AS failed,
      COUNT(*) FILTER (WHERE status = 0)::int AS pending
    FROM t_applications
    WHERE userid = $1
  `, [userId]);
  return result.rows[0];
};

export const getApplicationById = async (applicationId, userId) => {
  const result = await executeQuery(
    'SELECT * FROM t_applications WHERE applicationid = $1 AND userid = $2 LIMIT 1',
    [applicationId, userId],
  );
  return result.rows[0] || null;
};