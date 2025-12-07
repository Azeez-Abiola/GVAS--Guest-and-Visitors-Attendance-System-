-- Migration to add guest codes and QR codes to existing visitors
-- Run this to update existing visitors with guest codes

-- Function to generate random 8-character alphanumeric code
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

-- Update existing visitors without guest codes
UPDATE visitors 
SET 
  guest_code = generate_guest_code(),
  qr_code = guest_code
WHERE guest_code IS NULL OR guest_code = '';

-- Ensure all future visitors get guest codes
ALTER TABLE visitors 
ALTER COLUMN guest_code SET DEFAULT generate_guest_code();

-- Add comment
COMMENT ON COLUMN visitors.guest_code IS '8-character unique code for visitor check-in';
COMMENT ON COLUMN visitors.qr_code IS 'QR code data (same as guest_code)';
