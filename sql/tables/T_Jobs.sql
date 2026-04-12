-- ============================================================
-- T_Jobs
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'T_Jobs')
BEGIN
  CREATE TABLE T_Jobs (
    JobId          UNIQUEIDENTIFIER  NOT NULL  DEFAULT NEWID()  PRIMARY KEY,
    UserId         UNIQUEIDENTIFIER  NOT NULL,
    CompanyName    NVARCHAR(255)     NOT NULL,
    JobTitle       NVARCHAR(255)     NOT NULL,
    JobDescription NVARCHAR(MAX)     NULL,
    RequiredSkills NVARCHAR(MAX)     NULL,   -- JSON array extracted by AI
    ContactEmail   NVARCHAR(255)     NULL,
    ContactPhone   NVARCHAR(20)      NULL,
    Channel        TINYINT           NOT NULL  DEFAULT 1,  -- 1=Email 2=WhatsApp 3=Both
    CreatedAt      DATETIME          NOT NULL  DEFAULT GETDATE(),
    IsActive       BIT               NOT NULL  DEFAULT 1,

    CONSTRAINT FK_Jobs_Users FOREIGN KEY (UserId) REFERENCES T_Users(UserId),
    CONSTRAINT CK_Jobs_Channel CHECK (Channel IN (1, 2, 3)),
    CONSTRAINT CK_Jobs_ContactRequired CHECK (
      (Channel IN (1, 3) AND ContactEmail IS NOT NULL) OR
      (Channel IN (2, 3) AND ContactPhone IS NOT NULL) OR
      Channel = 2
    )
  );

  CREATE INDEX IX_Jobs_UserId ON T_Jobs(UserId);

  PRINT 'T_Jobs created';
END
ELSE
  PRINT 'T_Jobs already exists';
GO
