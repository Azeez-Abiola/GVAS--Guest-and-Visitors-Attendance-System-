-- Migration: Update visitors table for check-in functionality
-- Description: Add fields to track visitor check-in status, timing, and access codes
-- Date: 2025-12-05

-- Add check-in tracking columns
ALTER TABLE visitors
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS access_code VARCHAR(10);

-- Add comments
COMMENT ON COLUMN visitors.checked_in_at IS 'Timestamp when visitor was checked in by receptionist';
COMMENT ON COLUMN visitors.checked_in_by IS 'User ID of the receptionist who checked in the visitor';
COMMENT ON COLUMN visitors.access_code IS 'Unique access code generated during check-in for visitor identification';

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visitors_checked_in_at ON visitors(checked_in_at);
CREATE INDEX IF NOT EXISTS idx_visitors_checked_in_by ON visitors(checked_in_by);
CREATE INDEX IF NOT EXISTS idx_visitors_access_code ON visitors(access_code) WHERE access_code IS NOT NULL;

-- Ensure status column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'visitors' AND column_name = 'status'
  ) THEN
    ALTER TABLE visitors ADD COLUMN status VARCHAR(20) DEFAULT 'checked_out';
  END IF;
END $$;

-- Update ALL existing visitors to have valid status values
-- Convert any invalid statuses to 'checked_out'
UPDATE visitors 
SET status = CASE 
  WHEN status IN ('pending', 'checked_in', 'checked_out', 'cancelled') THEN status
  WHEN status IS NULL OR status = '' THEN 'checked_out'
  ELSE 'checked_out'
END
WHERE status NOT IN ('pending', 'checked_in', 'checked_out', 'cancelled') 
   OR status IS NULL 
   OR status = '';

-- Drop existing constraint if it exists
ALTER TABLE visitors DROP CONSTRAINT IF EXISTS visitors_status_check;

-- Add check constraint for status values (now safe since all data is valid)
ALTER TABLE visitors 
ADD CONSTRAINT visitors_status_check 
CHECK (status IN ('pending', 'checked_in', 'checked_out', 'cancelled'));
