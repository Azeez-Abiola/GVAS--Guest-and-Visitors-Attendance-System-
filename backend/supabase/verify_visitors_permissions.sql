-- Verify what policies and permissions exist on visitors table

-- 1. Check table permissions for anon role
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'visitors'
AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY grantee, privilege_type;

-- 2. List all policies on visitors table
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'visitors'
ORDER BY policyname;
