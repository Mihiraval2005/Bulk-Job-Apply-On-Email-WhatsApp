-- ============================================================
-- SP_Templates_GetList
-- ============================================================
CREATE OR ALTER PROCEDURE SP_Templates_GetList
  @UserId  UNIQUEIDENTIFIER,
  @Channel TINYINT = NULL   -- NULL = all
AS
BEGIN
  SET NOCOUNT ON;

  SELECT
    TemplateId,
    Name,
    Channel,
    Tone,
    SubjectTemplate,
    BodyTemplate,
    IsDefault,
    CreatedAt,
    UpdatedAt
  FROM T_Templates
  WHERE UserId  = @UserId
    AND (@Channel IS NULL OR Channel = @Channel)
  ORDER BY IsDefault DESC, CreatedAt DESC;
END
GO

-- ============================================================
-- SP_Templates_Insert
-- ============================================================
CREATE OR ALTER PROCEDURE SP_Templates_Insert
  @TemplateId      UNIQUEIDENTIFIER,
  @UserId          UNIQUEIDENTIFIER,
  @Name            NVARCHAR(255),
  @Channel         TINYINT,
  @Tone            NVARCHAR(20) = 'formal',
  @SubjectTemplate NVARCHAR(512) = NULL,
  @BodyTemplate    NVARCHAR(MAX),
  @IsDefault       BIT = 0
AS
BEGIN
  SET NOCOUNT ON;

  -- If setting as default, clear others first
  IF @IsDefault = 1
  BEGIN
    UPDATE T_Templates
    SET IsDefault = 0
    WHERE UserId = @UserId AND Channel = @Channel;
  END

  INSERT INTO T_Templates
    (TemplateId, UserId, Name, Channel, Tone, SubjectTemplate, BodyTemplate, IsDefault)
  VALUES
    (@TemplateId, @UserId, @Name, @Channel, @Tone, @SubjectTemplate, @BodyTemplate, @IsDefault);

  SELECT TemplateId, Name, Channel, Tone, SubjectTemplate, BodyTemplate, IsDefault, CreatedAt
  FROM T_Templates
  WHERE TemplateId = @TemplateId;
END
GO

-- ============================================================
-- SP_Templates_Update
-- ============================================================
CREATE OR ALTER PROCEDURE SP_Templates_Update
  @TemplateId      UNIQUEIDENTIFIER,
  @UserId          UNIQUEIDENTIFIER,
  @Name            NVARCHAR(255),
  @Tone            NVARCHAR(20),
  @SubjectTemplate NVARCHAR(512) = NULL,
  @BodyTemplate    NVARCHAR(MAX),
  @IsDefault       BIT = 0
AS
BEGIN
  SET NOCOUNT ON;

  IF @IsDefault = 1
  BEGIN
    UPDATE T_Templates
    SET IsDefault = 0
    WHERE UserId = @UserId
      AND TemplateId != @TemplateId;
  END

  UPDATE T_Templates
  SET
    Name            = @Name,
    Tone            = @Tone,
    SubjectTemplate = @SubjectTemplate,
    BodyTemplate    = @BodyTemplate,
    IsDefault       = @IsDefault,
    UpdatedAt       = GETDATE()
  WHERE TemplateId = @TemplateId AND UserId = @UserId;
END
GO

-- ============================================================
-- SP_Templates_Delete
-- ============================================================
CREATE OR ALTER PROCEDURE SP_Templates_Delete
  @TemplateId UNIQUEIDENTIFIER,
  @UserId     UNIQUEIDENTIFIER
AS
BEGIN
  SET NOCOUNT ON;

  DELETE FROM T_Templates
  WHERE TemplateId = @TemplateId AND UserId = @UserId;
END
GO
