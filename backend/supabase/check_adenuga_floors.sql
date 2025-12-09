-- Check assigned_floors for user Adenuga A
SELECT id, full_name, email, role, assigned_floors, jsonb_typeof(to_jsonb(assigned_floors)) as data_type
FROM users
WHERE full_name ILIKE '%Adenuga%' OR email ILIKE '%adenuga%';
