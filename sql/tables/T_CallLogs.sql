-- ============================================================
-- T_CallLogs  (Phase 2 - AI Voice Calling)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'T_CallLogs')
BEGIN
  CREATE TABLE T_CallLogs (
    CallId         UNIQUEIDENTIFIER  NOT NULL  DEFAULT NEWID()  PRIMARY KEY,
    JobId          UNIQUEIDENTIFIER  NOT NULL,
    UserId         UNIQUEIDENTIFIER  NOT NULL,
    ToPhone        NVARCHAR(20)      NOT NULL,
    TwilioCallSid  NVARCHAR(100)     NULL,
    Status         NVARCHAR(50)      NULL,   -- initiated|ringing|in-progress|completed|failed|busy|no-answer
    Duration       INT               NULL,   -- seconds
    RecordingUrl   NVARCHAR(1000)    NULL,
    Transcript     NVARCHAR(MAX)     NULL,   -- full call transcript
    HrResponse     NVARCHAR(MAX)     NULL,   -- AI summary of HR's response
    Sentiment      NVARCHAR(20)      NULL,   -- positive|neutral|negative
    CalledAt       DATETIME          NOT NULL  DEFAULT GETDATE(),
    CompletedAt    DATETIME          NULL,

    CONSTRAINT FK_CallLogs_Jobs  FOREIGN KEY (JobId)  REFERENCES T_Jobs(JobId),
    CONSTRAINT FK_CallLogs_Users FOREIGN KEY (UserId) REFERENCES T_Users(UserId)
  );

  CREATE INDEX IX_CallLogs_UserId ON T_CallLogs(UserId);
  CREATE INDEX IX_CallLogs_JobId  ON T_CallLogs(JobId);

  PRINT 'T_CallLogs created';
END
ELSE
  PRINT 'T_CallLogs already exists';
GO
