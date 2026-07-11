-- PostgreSQL Migration: Add contactEmail and contactPhone to t_applications
-- Purpose: Store contact information for email/WhatsApp applications and retry functionality
-- Created: 2026-07-10

ALTER TABLE t_applications
ADD COLUMN IF NOT EXISTS contactemail VARCHAR(255),
ADD COLUMN IF NOT EXISTS contactphone VARCHAR(20);

-- Verify columns exist
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 't_applications' 
AND column_name IN ('contactemail', 'contactphone');
