-- Migration: Add delivery fields to visitors table
-- Date: 2024-12-15

ALTER TABLE visitors ADD COLUMN IF NOT EXISTS visitor_type TEXT DEFAULT 'visitor';
ALTER TABLE visitors ADD COLUMN IF NOT EXISTS driver_address TEXT;

-- Index for filtering by visitor_type
CREATE INDEX IF NOT EXISTS idx_visitors_type ON visitors(visitor_type);

-- Update existing records to have 'visitor' type
UPDATE visitors SET visitor_type = 'visitor' WHERE visitor_type IS NULL;
