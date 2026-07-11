-- Migration: Add contactEmail and contactPhone fields to T_Applications
-- Purpose: Store contact information for retry and audit purposes
-- Created: 2026-07-10

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='T_Applications' AND COLUMN_NAME='ContactEmail')
BEGIN
  ALTER TABLE T_Applications
  ADD ContactEmail NVARCHAR(255) NULL;
  PRINT 'ContactEmail column added to T_Applications';
END
ELSE
  PRINT 'ContactEmail column already exists';

IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='T_Applications' AND COLUMN_NAME='ContactPhone')
BEGIN
  ALTER TABLE T_Applications
  ADD ContactPhone NVARCHAR(20) NULL;
  PRINT 'ContactPhone column added to T_Applications';
END
ELSE
  PRINT 'ContactPhone column already exists';

-- For PostgreSQL (if using PostgreSQL instead of SQL Server):
/*
ALTER TABLE t_applications
ADD COLUMN IF NOT EXISTS contactemail VARCHAR(255),
ADD COLUMN IF NOT EXISTS contactphone VARCHAR(20);
*/
