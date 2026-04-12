-- ============================================================
-- SP_Applications_Upsert
-- Insert new or update existing application record
-- ============================================================
CREATE OR ALTER PROCEDURE SP_Applications_Upsert
  @ApplicationId UNIQUEIDENTIFIER,
  @JobId         UNIQUEIDENTIFIER,
  @UserId        UNIQUEIDENTIFIER,
  @Channel       TINYINT,
  @Status        TINYINT,
  @EmailSubject  NVARCHAR(512)  = NULL,
  @EmailBody     NVARCHAR(MAX)  = NULL,
  @WhatsAppMsg   NVARCHAR(MAX)  = NULL,
  @ErrorMsg      NVARCHAR(MAX)  = NULL
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (SELECT 1 FROM T_Applications WHERE ApplicationId = @ApplicationId)
  BEGIN
    UPDATE T_Applications
    SET
      Status      = @Status,
      ErrorMsg    = @ErrorMsg,
      SentAt      = CASE WHEN @Status = 1 THEN GETDATE() ELSE SentAt END,
      RetryCount  = CASE WHEN @Status = 2 THEN RetryCount + 1 ELSE RetryCount END,
      UpdatedAt   = GETDATE()
    WHERE ApplicationId = @ApplicationId;
  END
  ELSE
  BEGIN
    INSERT INTO T_Applications
      (ApplicationId, JobId, UserId, Channel, Status, EmailSubject, EmailBody, WhatsAppMsg, ErrorMsg)
    VALUES
      (@ApplicationId, @JobId, @UserId, @Channel, @Status, @EmailSubject, @EmailBody, @WhatsAppMsg, @ErrorMsg);
  END

  -- Return updated record
  SELECT
    a.ApplicationId, a.JobId, a.UserId, a.Channel, a.Status,
    a.SentAt, a.RetryCount, a.ErrorMsg, a.UpdatedAt
  FROM T_Applications a
  WHERE a.ApplicationId = @ApplicationId;
END
GO

-- ============================================================
-- SP_Applications_UpdateStatus  (webhook / retry)
-- ============================================================
CREATE OR ALTER PROCEDURE SP_Applications_UpdateStatus
  @ApplicationId UNIQUEIDENTIFIER,
  @Status        TINYINT,
  @ErrorMsg      NVARCHAR(MAX) = NULL
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE T_Applications
  SET
    Status    = @Status,
    SentAt    = CASE WHEN @Status = 1 THEN GETDATE() ELSE SentAt END,
    RetryCount= CASE WHEN @Status = 2 THEN RetryCount + 1 ELSE RetryCount END,
    ErrorMsg  = @ErrorMsg,
    UpdatedAt = GETDATE()
  WHERE ApplicationId = @ApplicationId;
END
GO
