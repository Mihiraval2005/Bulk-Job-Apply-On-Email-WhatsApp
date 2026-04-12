-- ============================================================
-- T_Users
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'T_Users')
BEGIN
  CREATE TABLE T_Users (
    UserId        UNIQUEIDENTIFIER  NOT NULL  DEFAULT NEWID()  PRIMARY KEY,
    Email         NVARCHAR(255)     NOT NULL,
    PasswordHash  NVARCHAR(512)     NOT NULL,
    FullName      NVARCHAR(255)     NOT NULL,
    ResumeUrl     NVARCHAR(1000)    NULL,
    ResumeProfile NVARCHAR(MAX)     NULL,   -- JSON from Claude resume parse
    CreatedAt     DATETIME          NOT NULL  DEFAULT GETDATE(),
    UpdatedAt     DATETIME          NOT NULL  DEFAULT GETDATE(),
    IsActive      BIT               NOT NULL  DEFAULT 1,

    CONSTRAINT UQ_Users_Email UNIQUE (Email)
  );

  PRINT 'T_Users created';
END
ELSE
  PRINT 'T_Users already exists';
GO
