-- Run this SQL in your Supabase SQL Editor to add guest codes to existing visitors
-- URL: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Step 1: Create the guest code generation function
CREATE OR REPLACE FUNCTION generate_guest_code() 
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Update existing visitors with guest codes
-- This will only update visitors that don't have a guest code
-- First, generate and set guest codes
UPDATE visitors 
SET guest_code = generate_guest_code()
WHERE guest_code IS NULL OR guest_code = '';

-- Then, copy guest_code to qr_code
UPDATE visitors
SET qr_code = guest_code
WHERE qr_code IS NULL OR qr_code = '' OR qr_code != guest_code;

-- Step 3: Verify the update
SELECT id, name, guest_code, qr_code, status 
FROM visitors 
ORDER BY created_at DESC
LIMIT 10;
