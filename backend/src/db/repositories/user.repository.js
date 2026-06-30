import { executeQuery } from '../../config/db.js';

export const createUser = async ({ userId, email, passwordHash, fullName }) => {
  const result = await executeQuery(`
    INSERT INTO t_users (userid, email, passwordhash, fullname, createdat, updatedat, isactive)
    VALUES ($1, $2, $3, $4, NOW(), NOW(), TRUE)
    RETURNING *
  `, [userId, email, passwordHash, fullName]);
  return result.rows[0];
};

export const findByEmail = async (email) => {
  const result = await executeQuery(
    'SELECT * FROM t_users WHERE email = $1 LIMIT 1',
    [email],
  );
  return result.rows[0] || null;
};

export const updateResume = async (userId, resumeUrl) => {
  await executeQuery(
    'UPDATE t_users SET resumeurl = $2, updatedat = NOW() WHERE userid = $1',
    [userId, resumeUrl],
  );
};

export const updateProfile = async (userId, resumeProfile) => {
  await executeQuery(
    'UPDATE t_users SET resumeprofile = $2, updatedat = NOW() WHERE userid = $1',
    [userId, resumeProfile],
  );
};
