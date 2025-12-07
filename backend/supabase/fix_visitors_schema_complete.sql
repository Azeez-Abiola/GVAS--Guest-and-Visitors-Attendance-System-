-- COMPLETE FIX FOR VISITORS TABLE SCHEMA
-- This script will make ALL required columns nullable or provide defaults
-- Run this ONCE to fix all visitor creation issues

-- First, let's see what we have
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'visitors'
ORDER BY ordinal_position;

-- Make host_name nullable (it should be looked up from host_id, not required on insert)
ALTER TABLE visitors ALTER COLUMN host_name DROP NOT NULL;

-- Make visitor_id auto-generate if not provided
ALTER TABLE visitors ALTER COLUMN visitor_id SET DEFAULT ('VIS-' || EXTRACT(EPOCH FROM NOW())::BIGINT);

-- Make status default to 'pre_registered'
ALTER TABLE visitors ALTER COLUMN status SET DEFAULT 'pre_registered';

-- Make tenant_id nullable (will be looked up from host)
ALTER TABLE visitors ALTER COLUMN tenant_id DROP NOT NULL;

-- Add any missing columns that the frontend might be using
DO $$ 
BEGIN
    -- Check if id_number column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitors' AND column_name = 'id_number') THEN
        ALTER TABLE visitors ADD COLUMN id_number TEXT;
    END IF;
    
    -- Check if id_type column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'visitors' AND column_name = 'id_type') THEN
        ALTER TABLE visitors ADD COLUMN id_type TEXT;
    END IF;
END $$;

-- Create a trigger to auto-populate host_name from host_id
CREATE OR REPLACE FUNCTION populate_host_name()
RETURNS TRIGGER AS $$
BEGIN
    -- If host_id is provided but host_name is not, look it up
    IF NEW.host_id IS NOT NULL AND NEW.host_name IS NULL THEN
        SELECT full_name INTO NEW.host_name
        FROM users
        WHERE id = NEW.host_id;
    END IF;
    
    -- If tenant_id is not provided but host_id is, look it up
    IF NEW.host_id IS NOT NULL AND NEW.tenant_id IS NULL THEN
        SELECT tenant_id INTO NEW.tenant_id
        FROM users
        WHERE id = NEW.host_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS populate_host_details ON visitors;
CREATE TRIGGER populate_host_details
    BEFORE INSERT ON visitors
    FOR EACH ROW
    EXECUTE FUNCTION populate_host_name();

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'visitors'
ORDER BY ordinal_position;

PRINT 'Visitors table schema fixed successfully!';
