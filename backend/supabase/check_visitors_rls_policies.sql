-- Diagnostic: Check RLS policies on visitors table
-- Run this to see what policies exist and their configuration

-- 1. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'visitors';

-- 2. List all policies on visitors table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'visitors'
ORDER BY policyname;

-- 3. Check current user and role
SELECT 
    current_user,
    session_user,
    current_role;
