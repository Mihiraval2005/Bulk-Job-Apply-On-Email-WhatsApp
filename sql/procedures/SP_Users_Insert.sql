-- ============================================================
-- SP_Users_Insert
-- SP_Users_GetByEmail
-- SP_Users_UpdateResume
-- SP_Users_UpdateProfile
-- ============================================================

-- Insert new user
CREATE OR ALTER PROCEDURE SP_Users_Insert
  @UserId        UNIQUEIDENTIFIER,
  @Email         NVARCHAR(255),
  @PasswordHash  NVARCHAR(512),
  @FullName      NVARCHAR(255)
AS
BEGIN
  SET NOCOUNT ON;

  INSERT INTO T_Users (UserId, Email, PasswordHash, FullName)
  VALUES (@UserId, @Email, @PasswordHash, @FullName);

  SELECT UserId, Email, FullName, CreatedAt
  FROM T_Users
  WHERE UserId = @UserId;
END
GO

-- Get user by email (login)
CREATE OR ALTER PROCEDURE SP_Users_GetByEmail
  @Email NVARCHAR(255)
AS
BEGIN
  SET NOCOUNT ON;

  SELECT UserId, Email, PasswordHash, FullName, ResumeUrl, ResumeProfile, IsActive
  FROM T_Users
  WHERE Email = @Email AND IsActive = 1;
END
GO

-- Update resume file URL after upload
CREATE OR ALTER PROCEDURE SP_Users_UpdateResume
  @UserId    UNIQUEIDENTIFIER,
  @ResumeUrl NVARCHAR(1000)
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE T_Users
  SET ResumeUrl = @ResumeUrl,
      UpdatedAt = GETDATE()
  WHERE UserId = @UserId;
END
GO

-- Save parsed resume JSON (from Claude)
CREATE OR ALTER PROCEDURE SP_Users_UpdateProfile
  @UserId        UNIQUEIDENTIFIER,
  @ResumeProfile NVARCHAR(MAX)   -- JSON
AS
BEGIN
  SET NOCOUNT ON;

  UPDATE T_Users
  SET ResumeProfile = @ResumeProfile,
      UpdatedAt     = GETDATE()
  WHERE UserId = @UserId;
END
GO
