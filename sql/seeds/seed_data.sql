-- ============================================================
-- Seed Data  (dev/testing only)
-- Run after all tables are created
-- ============================================================

-- Sample user (password: Test@1234  — bcrypt hash below)
IF NOT EXISTS (SELECT 1 FROM T_Users WHERE Email = 'test@bulkapply.com')
BEGIN
  INSERT INTO T_Users (UserId, Email, PasswordHash, FullName)
  VALUES (
    NEWID(),
    'test@bulkapply.com',
    '$2a$12$K8J3v.XLvKQwN5VZJhHqyOQ5YlD1NKCS3pZ8XPH2lM7Eq6sZkXANu',
    'Test User'
  );
  PRINT 'Seed user inserted';
END

-- Sample email template
DECLARE @SeedUserId UNIQUEIDENTIFIER = (
  SELECT TOP 1 UserId FROM T_Users WHERE Email = 'test@bulkapply.com'
);

IF @SeedUserId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM T_Templates WHERE UserId = @SeedUserId)
BEGIN
  INSERT INTO T_Templates (TemplateId, UserId, Name, Channel, Tone, SubjectTemplate, BodyTemplate, IsDefault)
  VALUES (
    NEWID(),
    @SeedUserId,
    'Default Formal Email',
    1,
    'formal',
    'Application for {{jobTitle}} - {{candidateName}}',
    '<p>Dear Hiring Manager,</p>
<p>I am writing to express my strong interest in the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>.</p>
<p>With {{yearsExp}} years of experience and skills in {{topSkills}}, I believe I would be a valuable addition to your team.</p>
<p>Please find my resume attached for your review.</p>
<p>I would welcome the opportunity to discuss how my background aligns with your requirements.</p>
<p>Best regards,<br>{{candidateName}}</p>',
    1
  );

  INSERT INTO T_Templates (TemplateId, UserId, Name, Channel, Tone, BodyTemplate, IsDefault)
  VALUES (
    NEWID(),
    @SeedUserId,
    'Default WhatsApp',
    2,
    'semiformal',
    'Hi, I am {{candidateName}}, a {{jobTitle}} with {{yearsExp}} years of experience in {{topSkills}}. I would love to explore the opportunity at {{companyName}}. Please find my resume here: {{resumeLink}}. Looking forward to connecting!',
    1
  );

  PRINT 'Seed templates inserted';
END
GO
