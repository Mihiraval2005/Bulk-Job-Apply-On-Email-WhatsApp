-- ============================================================
-- TVP Type for bulk job insert
-- ============================================================
IF NOT EXISTS (
  SELECT 1 FROM sys.types WHERE name = 'TVP_Jobs' AND is_table_type = 1
)
BEGIN
  CREATE TYPE TVP_Jobs AS TABLE (
    CompanyName    NVARCHAR(255),
    JobTitle       NVARCHAR(255),
    JobDescription NVARCHAR(MAX),
    ContactEmail   NVARCHAR(255),
    ContactPhone   NVARCHAR(20),
    Channel        TINYINT
  );
  PRINT 'TVP_Jobs created';
END
GO

-- ============================================================
-- SP_Jobs_BulkInsert
-- ============================================================
CREATE OR ALTER PROCEDURE SP_Jobs_BulkInsert
  @UserId UNIQUEIDENTIFIER,
  @Jobs   TVP_Jobs READONLY
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO T_Jobs (UserId, CompanyName, JobTitle, JobDescription, ContactEmail, ContactPhone, Channel)
  SELECT
    @UserId,
    CompanyName,
    JobTitle,
    JobDescription,
    ContactEmail,
    ContactPhone,
    Channel
  FROM @Jobs;

  -- Return inserted rows
  SELECT j.JobId, j.CompanyName, j.JobTitle, j.ContactEmail, j.ContactPhone, j.Channel, j.CreatedAt
  FROM T_Jobs j
  WHERE j.UserId = @UserId
    AND j.CreatedAt >= DATEADD(SECOND, -5, GETDATE())  -- just inserted rows
  ORDER BY j.CreatedAt DESC;
END
GO

-- ============================================================
-- SP_Jobs_GetByUser
-- ============================================================
CREATE OR ALTER PROCEDURE SP_Jobs_GetByUser
  @UserId UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    j.JobId,
    j.CompanyName,
    j.JobTitle,
    j.JobDescription,
    j.RequiredSkills,
    j.ContactEmail,
    j.ContactPhone,
    j.Channel,
    j.CreatedAt,
    -- Application status for this job (if sent)
    a.Status        AS ApplicationStatus,
    a.SentAt        AS ApplicationSentAt,
    a.ApplicationId
  FROM T_Jobs j
  LEFT JOIN T_Applications a ON a.JobId = j.JobId AND a.UserId = @UserId
  WHERE j.UserId = @UserId AND j.IsActive = 1
  ORDER BY j.CreatedAt DESC;
END
GO

-- ============================================================
-- SP_Jobs_UpdateSkills  (after AI extraction)
-- ============================================================
CREATE OR ALTER PROCEDURE SP_Jobs_UpdateSkills
  @JobId         UNIQUEIDENTIFIER,
  @RequiredSkills NVARCHAR(MAX)   -- JSON array
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE T_Jobs
  SET RequiredSkills = @RequiredSkills
  WHERE JobId = @JobId;
END
GO
