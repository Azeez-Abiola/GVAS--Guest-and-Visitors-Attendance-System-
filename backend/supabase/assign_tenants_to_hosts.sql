-- Fix hosts by assigning them to their correct tenants (floors)
-- This assigns each host to the tenant matching their floor

-- First, let's see what we have
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.tenant_id,
    t.name as current_tenant,
    t.floor_number as current_floor
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.role = 'host'
ORDER BY u.email;

-- Now assign hosts to their correct tenants based on their email/description
-- Assuming you have hosts for different floors

-- Update Floor 1 host
UPDATE users 
SET tenant_id = (SELECT id FROM tenants WHERE floor_number = 1 LIMIT 1)
WHERE role = 'host' 
  AND (email LIKE '%floor1%' OR full_name LIKE '%Floor 1%')
  AND tenant_id IS NULL;

-- Update Floor 2 host  
UPDATE users 
SET tenant_id = (SELECT id FROM tenants WHERE floor_number = 2 LIMIT 1)
WHERE role = 'host' 
  AND (email LIKE '%floor2%' OR full_name LIKE '%Floor 2%')
  AND tenant_id IS NULL;

-- Update Floor 3 host
UPDATE users 
SET tenant_id = (SELECT id FROM tenants WHERE floor_number = 3 LIMIT 1)
WHERE role = 'host' 
  AND (email LIKE '%floor3%' OR full_name LIKE '%Floor 3%')
  AND tenant_id IS NULL;

-- If there are any remaining hosts without tenant_id, assign them to Floor 1 by default
UPDATE users 
SET tenant_id = (SELECT id FROM tenants WHERE floor_number = 1 LIMIT 1)
WHERE role = 'host' AND tenant_id IS NULL;

-- Verify the fix
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    t.name as tenant_name,
    t.floor_number
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.role = 'host'
ORDER BY t.floor_number, u.full_name;

-- Show summary
SELECT 
    CASE 
        WHEN tenant_id IS NULL THEN 'Missing tenant_id'
        ELSE 'Has tenant_id'
    END as status,
    COUNT(*) as count
FROM users
WHERE role = 'host'
GROUP BY status;
