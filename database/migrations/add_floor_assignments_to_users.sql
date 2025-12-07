-- Migration: Add floor assignments to users table
-- Description: Allows receptionists to be assigned to specific floors for visitor management
-- Date: 2025-12-05

-- Add assigned_floors column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS assigned_floors JSONB DEFAULT '[]'::jsonb;

-- Add comment to column
COMMENT ON COLUMN users.assigned_floors IS 'Array of floor numbers that a receptionist is assigned to. Used for reception role only.';

-- Create index for faster queries on assigned floors
CREATE INDEX IF NOT EXISTS idx_users_assigned_floors ON users USING GIN (assigned_floors);

-- Example usage:
-- UPDATE users SET assigned_floors = '["1", "2", "3"]'::jsonb WHERE id = 'user-id' AND role = 'reception';
