import { getPool } from './db.js';

export const initDatabase = async () => {
  const pool = await getPool();

  const statements = [
    'CREATE EXTENSION IF NOT EXISTS pgcrypto',
    `CREATE TABLE IF NOT EXISTS t_users (
      userid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) NOT NULL UNIQUE,
      passwordhash VARCHAR(512) NOT NULL,
      fullname VARCHAR(255) NOT NULL,
      resumeurl VARCHAR(1000),
      resumeprofile TEXT,
      createdat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updatedat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      isactive BOOLEAN NOT NULL DEFAULT TRUE
    )`,
    `CREATE TABLE IF NOT EXISTS t_jobs (
      jobid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      userid UUID NOT NULL REFERENCES t_users(userid) ON DELETE CASCADE,
      companyname VARCHAR(255) NOT NULL,
      jobtitle VARCHAR(255) NOT NULL,
      jobdescription TEXT,
      requiredskills TEXT,
      contactemail VARCHAR(255),
      contactphone VARCHAR(20),
      channel INTEGER NOT NULL DEFAULT 1 CHECK (channel IN (1,2,3)),
      createdat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      isactive BOOLEAN NOT NULL DEFAULT TRUE
    )`,
    `CREATE TABLE IF NOT EXISTS t_applications (
      applicationid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      jobid UUID NOT NULL REFERENCES t_jobs(jobid) ON DELETE CASCADE,
      userid UUID NOT NULL REFERENCES t_users(userid) ON DELETE CASCADE,
      channel INTEGER NOT NULL CHECK (channel IN (1,2,3)),
      status INTEGER NOT NULL DEFAULT 0 CHECK (status IN (0,1,2,3)),
      emailsubject VARCHAR(512),
      emailbody TEXT,
      whatsappmsg TEXT,
      sentat TIMESTAMPTZ,
      errormsg TEXT,
      retrycount INTEGER NOT NULL DEFAULT 0,
      createdat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updatedat TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS t_templates (
      templateid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      userid UUID NOT NULL REFERENCES t_users(userid) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      channel INTEGER NOT NULL CHECK (channel IN (1,2)),
      tone VARCHAR(20) NOT NULL DEFAULT 'formal' CHECK (tone IN ('formal','semiformal','casual')),
      subjecttemplate VARCHAR(512),
      bodytemplate TEXT NOT NULL,
      isdefault BOOLEAN NOT NULL DEFAULT FALSE,
      createdat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updatedat TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    'CREATE INDEX IF NOT EXISTS idx_t_jobs_userid ON t_jobs(userid)',
    'CREATE INDEX IF NOT EXISTS idx_t_applications_userid ON t_applications(userid)',
    'CREATE INDEX IF NOT EXISTS idx_t_applications_jobid ON t_applications(jobid)',
    'CREATE INDEX IF NOT EXISTS idx_t_templates_userid ON t_templates(userid)',
  ];

  for (const statement of statements) {
    await pool.query(statement);
  }
};
