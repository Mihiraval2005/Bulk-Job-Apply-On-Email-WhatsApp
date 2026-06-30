import { executeQuery } from '../../config/db.js';

export const bulkInsertJobs = async (userId, jobs) => {
  const inserted = [];

  for (const job of jobs) {
    const result = await executeQuery(`
      INSERT INTO t_jobs (
        userid, companyname, jobtitle, jobdescription, requiredskills, contactemail, contactphone, channel, createdat, isactive
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), TRUE)
      RETURNING *
    `, [
      userId,
      job.companyName,
      job.jobTitle,
      job.jobDescription || null,
      job.requiredSkills || null,
      job.contactEmail || null,
      job.contactPhone || null,
      job.channel,
    ]);

    inserted.push(result.rows[0]);
  }

  return inserted;
};

export const getJobsByUser = async (userId) => {
  const result = await executeQuery(
    'SELECT * FROM t_jobs WHERE userid = $1 ORDER BY createdat DESC',
    [userId],
  );
  return result.rows;
};
