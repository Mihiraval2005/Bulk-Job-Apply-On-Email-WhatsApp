-- ============================================================
-- T_Applications
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'T_Applications')
BEGIN
  CREATE TABLE T_Applications (
    ApplicationId UNIQUEIDENTIFIER  NOT NULL  DEFAULT NEWID()  PRIMARY KEY,
    JobId         UNIQUEIDENTIFIER  NOT NULL,
    UserId        UNIQUEIDENTIFIER  NOT NULL,
    Channel       TINYINT           NOT NULL,   -- 1=Email 2=WhatsApp 3=Both
    Status        TINYINT           NOT NULL  DEFAULT 0,
    -- 0=Pending 1=Sent 2=Failed 3=Opened(email read receipt)
    EmailSubject  NVARCHAR(512)     NULL,
    EmailBody     NVARCHAR(MAX)     NULL,
    WhatsAppMsg   NVARCHAR(MAX)     NULL,
    SentAt        DATETIME          NULL,
    ErrorMsg      NVARCHAR(MAX)     NULL,
    RetryCount    TINYINT           NOT NULL  DEFAULT 0,
    CreatedAt     DATETIME          NOT NULL  DEFAULT GETDATE(),
    UpdatedAt     DATETIME          NOT NULL  DEFAULT GETDATE(),

    CONSTRAINT FK_Applications_Jobs  FOREIGN KEY (JobId)  REFERENCES T_Jobs(JobId),
    CONSTRAINT FK_Applications_Users FOREIGN KEY (UserId) REFERENCES T_Users(UserId),
    CONSTRAINT CK_Applications_Channel CHECK (Channel IN (1, 2, 3)),
    CONSTRAINT CK_Applications_Status  CHECK (Status  IN (0, 1, 2, 3))
  );

  CREATE INDEX IX_Applications_UserId ON T_Applications(UserId);
  CREATE INDEX IX_Applications_JobId  ON T_Applications(JobId);
  CREATE INDEX IX_Applications_Status ON T_Applications(Status);

  PRINT 'T_Applications created';
END
ELSE
  PRINT 'T_Applications already exists';
GO
