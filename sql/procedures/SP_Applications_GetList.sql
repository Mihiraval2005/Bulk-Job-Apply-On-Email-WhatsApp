-- ============================================================
-- SP_Applications_GetList
-- Full list with job details for dashboard
-- ============================================================
CREATE OR ALTER PROCEDURE SP_Applications_GetList
  @UserId  UNIQUEIDENTIFIER,
  @Status  TINYINT = NULL   -- NULL = all, 0/1/2/3 = filter
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    a.ApplicationId,
    a.Status,
    a.Channel,
    a.SentAt,
    a.RetryCount,
    a.ErrorMsg,
    a.EmailSubject,
    a.WhatsAppMsg,
    a.CreatedAt,
    a.UpdatedAt,

    -- Job details
    j.JobId,
    j.CompanyName,
    j.JobTitle,
    j.ContactEmail,
    j.ContactPhone,

    -- Status label
    CASE a.Status
      WHEN 0 THEN 'Pending'
      WHEN 1 THEN 'Sent'
      WHEN 2 THEN 'Failed'
      WHEN 3 THEN 'Opened'
    END AS StatusLabel,

    -- Channel label
    CASE a.Channel
      WHEN 1 THEN 'Email'
      WHEN 2 THEN 'WhatsApp'
      WHEN 3 THEN 'Both'
    END AS ChannelLabel

  FROM T_Applications a
  INNER JOIN T_Jobs j ON j.JobId = a.JobId
  WHERE a.UserId = @UserId
    AND (@Status IS NULL OR a.Status = @Status)
  ORDER BY a.CreatedAt DESC;
END
GO

-- ============================================================
-- SP_Applications_GetStats
-- Summary counts for dashboard tiles
-- ============================================================
CREATE OR ALTER PROCEDURE SP_Applications_GetStats
  @UserId UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    COUNT(*)                                    AS Total,
    SUM(CASE WHEN Status = 0 THEN 1 ELSE 0 END) AS Pending,
    SUM(CASE WHEN Status = 1 THEN 1 ELSE 0 END) AS Sent,
    SUM(CASE WHEN Status = 2 THEN 1 ELSE 0 END) AS Failed,
    SUM(CASE WHEN Status = 3 THEN 1 ELSE 0 END) AS Opened,
    SUM(CASE WHEN Channel IN (1,3) AND Status = 1 THEN 1 ELSE 0 END) AS EmailsSent,
    SUM(CASE WHEN Channel IN (2,3) AND Status = 1 THEN 1 ELSE 0 END) AS WhatsAppSent
  FROM T_Applications
  WHERE UserId = @UserId;
END
GO

-- ============================================================
-- SP_Applications_GetById
-- Single application with full body content
-- ============================================================
CREATE OR ALTER PROCEDURE SP_Applications_GetById
  @ApplicationId UNIQUEIDENTIFIER,
  @UserId        UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    a.*,
    j.CompanyName,
    j.JobTitle,
    j.ContactEmail,
    j.ContactPhone,
    CASE a.Status
      WHEN 0 THEN 'Pending'
      WHEN 1 THEN 'Sent'
      WHEN 2 THEN 'Failed'
      WHEN 3 THEN 'Opened'
    END AS StatusLabel
  FROM T_Applications a
  INNER JOIN T_Jobs j ON j.JobId = a.JobId
  WHERE a.ApplicationId = @ApplicationId
    AND a.UserId = @UserId;
END
GO
