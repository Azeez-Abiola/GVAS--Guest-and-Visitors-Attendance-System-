-- Check hosts and their tenant assignments
SELECT 
    id,
    email,
    full_name,
    role,
    tenant_id,
    is_active
FROM users
WHERE role = 'host'
ORDER BY full_name;

-- Check if any hosts are missing tenant_id
SELECT 
    id,
    email,
    full_name,
    'MISSING TENANT_ID' as issue
FROM users
WHERE role = 'host' AND tenant_id IS NULL;

-- Show available tenants (floors)
SELECT id, name, floor_number FROM tenants ORDER BY floor_number;

-- If hosts are missing tenant_id, you need to assign them
-- Example: Update a host to have a tenant
-- UPDATE users 
-- SET tenant_id = (SELECT id FROM tenants WHERE floor_number = 1 LIMIT 1)
-- WHERE email = 'host@example.com';
