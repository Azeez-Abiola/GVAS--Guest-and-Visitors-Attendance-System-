-- Sync host users from users table to hosts table
-- This resolves the foreign key constraint issue where visitors.host_id references hosts.id

-- First, check what's in users table with role='host'
SELECT 
    id,
    email,
    full_name,
    phone,
    role,
    tenant_id,
    created_at
FROM users
WHERE role = 'host'
ORDER BY email;

-- Check what's currently in hosts table
SELECT * FROM hosts ORDER BY email;

-- Now insert/update hosts from users table
-- Using ON CONFLICT to update if already exists
INSERT INTO hosts (
    id,
    tenant_id,
    name,
    email,
    phone,
    office_number,
    floor_number,
    role,
    active,
    created_at,
    updated_at
)
SELECT 
    u.id,
    u.tenant_id,
    u.full_name as name,
    u.email,
    u.phone as phone,
    NULL as office_number, -- Can be updated later
    COALESCE(t.floor_number, 1) as floor_number, -- Get from tenant, default to 1
    'host' as role,
    TRUE as active,
    u.created_at,
    NOW() as updated_at
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id
WHERE u.role = 'host'
ON CONFLICT (id) 
DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    floor_number = EXCLUDED.floor_number,
    updated_at = NOW();

-- Verify the sync
SELECT 
    h.id,
    h.name,
    h.email,
    h.phone,
    h.floor_number,
    t.name as tenant_name,
    h.active,
    h.created_at
FROM hosts h
LEFT JOIN tenants t ON h.tenant_id = t.id
ORDER BY h.email;

-- Check if all user hosts are now in hosts table
SELECT 
    'Users with role=host' as source,
    COUNT(*) as count
FROM users
WHERE role = 'host'
UNION ALL
SELECT 
    'Records in hosts table' as source,
    COUNT(*) as count
FROM hosts;
