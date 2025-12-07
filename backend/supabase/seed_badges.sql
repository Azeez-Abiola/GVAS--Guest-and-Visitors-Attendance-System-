-- Seed physical badges for UAC House
-- This creates a realistic badge inventory for the visitor management system

-- First, clear existing badges (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE badges RESTART IDENTITY CASCADE;

-- Insert Standard Visitor Badges (B001-B050)
INSERT INTO badges (badge_number, type, status, color, notes) VALUES
  ('B001', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B002', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B003', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B004', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B005', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B006', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B007', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B008', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B009', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B010', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B011', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B012', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B013', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B014', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B015', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B016', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B017', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B018', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B019', 'visitor', 'available', 'blue', 'Standard visitor badge'),
  ('B020', 'visitor', 'available', 'blue', 'Standard visitor badge');

-- Insert Contractor Badges (C001-C020)
INSERT INTO badges (badge_number, type, status, color, notes) VALUES
  ('C001', 'contractor', 'available', 'yellow', 'Contractor/vendor badge'),
  ('C002', 'contractor', 'available', 'yellow', 'Contractor/vendor badge'),
  ('C003', 'contractor', 'available', 'yellow', 'Contractor/vendor badge'),
  ('C004', 'contractor', 'available', 'yellow', 'Contractor/vendor badge'),
  ('C005', 'contractor', 'available', 'yellow', 'Contractor/vendor badge'),
  ('C006', 'contractor', 'available', 'yellow', 'Contractor/vendor badge'),
  ('C007', 'contractor', 'available', 'yellow', 'Contractor/vendor badge'),
  ('C008', 'contractor', 'available', 'yellow', 'Contractor/vendor badge'),
  ('C009', 'contractor', 'available', 'yellow', 'Contractor/vendor badge'),
  ('C010', 'contractor', 'available', 'yellow', 'Contractor/vendor badge');

-- Insert VIP Badges (V001-V010)
INSERT INTO badges (badge_number, type, status, color, notes) VALUES
  ('V001', 'vip', 'available', 'gold', 'VIP guest badge'),
  ('V002', 'vip', 'available', 'gold', 'VIP guest badge'),
  ('V003', 'vip', 'available', 'gold', 'VIP guest badge'),
  ('V004', 'vip', 'available', 'gold', 'VIP guest badge'),
  ('V005', 'vip', 'available', 'gold', 'VIP guest badge');

-- Insert Delivery/Courier Badges (D001-D010)
INSERT INTO badges (badge_number, type, status, color, notes) VALUES
  ('D001', 'delivery', 'available', 'green', 'Delivery/courier badge'),
  ('D002', 'delivery', 'available', 'green', 'Delivery/courier badge'),
  ('D003', 'delivery', 'available', 'green', 'Delivery/courier badge'),
  ('D004', 'delivery', 'available', 'green', 'Delivery/courier badge'),
  ('D005', 'delivery', 'available', 'green', 'Delivery/courier badge');

-- Set some badges to maintenance for realism
UPDATE badges SET status = 'maintenance', notes = 'Badge damaged - needs replacement' WHERE badge_number IN ('B020', 'C010');

-- Verify the insert
SELECT type, status, COUNT(*) as count 
FROM badges 
GROUP BY type, status 
ORDER BY type, status;

-- Display total count
SELECT COUNT(*) as total_badges FROM badges;
