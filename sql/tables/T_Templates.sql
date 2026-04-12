-- ============================================================
-- T_Templates
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'T_Templates')
BEGIN
  CREATE TABLE T_Templates (
    TemplateId      UNIQUEIDENTIFIER  NOT NULL  DEFAULT NEWID()  PRIMARY KEY,
    UserId          UNIQUEIDENTIFIER  NOT NULL,
    Name            NVARCHAR(255)     NOT NULL,
    Channel         TINYINT           NOT NULL,   -- 1=Email 2=WhatsApp
    Tone            NVARCHAR(20)      NOT NULL  DEFAULT 'formal',  -- formal|semiformal|casual
    SubjectTemplate NVARCHAR(512)     NULL,       -- Email only
    BodyTemplate    NVARCHAR(MAX)     NOT NULL,
    IsDefault       BIT               NOT NULL  DEFAULT 0,
    CreatedAt       DATETIME          NOT NULL  DEFAULT GETDATE(),
    UpdatedAt       DATETIME          NOT NULL  DEFAULT GETDATE(),

    CONSTRAINT FK_Templates_Users FOREIGN KEY (UserId) REFERENCES T_Users(UserId),
    CONSTRAINT CK_Templates_Channel CHECK (Channel IN (1, 2)),
    CONSTRAINT CK_Templates_Tone CHECK (Tone IN ('formal', 'semiformal', 'casual'))
  );

  CREATE INDEX IX_Templates_UserId ON T_Templates(UserId);

  PRINT 'T_Templates created';
END
ELSE
  PRINT 'T_Templates already exists';
GO
