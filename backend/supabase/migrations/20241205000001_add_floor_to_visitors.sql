-- Add floor column to visitors table for floor-based assignments
-- This enables receptionists to be notified only about visitors on their assigned floors

-- Add floor column to visitors
ALTER TABLE visitors 
ADD COLUMN IF NOT EXISTS floor VARCHAR(50);

-- Add index for faster floor-based queries
CREATE INDEX IF NOT EXISTS idx_visitors_floor ON visitors(floor);

-- Add comment
COMMENT ON COLUMN visitors.floor IS 'Floor where the visitor is assigned (e.g., Ground Floor, 1st Floor, etc.)';

-- Sample data update (optional) - Set floor to Ground Floor for existing visitors without floor
UPDATE visitors 
SET floor = 'Ground Floor' 
WHERE floor IS NULL;
