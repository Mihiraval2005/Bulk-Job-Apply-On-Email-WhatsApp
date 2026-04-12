-- ============================================================
-- BulkApply - Master SQL Setup Script
-- Run this file in SSMS against your BulkApply database
-- Order matters: Tables first, then TVP, then SPs, then seeds
-- ============================================================

-- 1. Tables
:r tables/T_Users.sql
:r tables/T_Jobs.sql
:r tables/T_Templates.sql
:r tables/T_Applications.sql
:r tables/T_CallLogs.sql

-- 2. Stored Procedures
:r procedures/SP_Users_Insert.sql
:r procedures/SP_Jobs_BulkInsert.sql
:r procedures/SP_Applications_Upsert.sql
:r procedures/SP_Applications_GetList.sql
:r procedures/SP_Templates_GetList.sql

-- 3. Seed Data (dev only — comment out for production)
:r seeds/seed_data.sql

PRINT '========================================';
PRINT 'BulkApply DB setup complete!';
PRINT '========================================';
GO
