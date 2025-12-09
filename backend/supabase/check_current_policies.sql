-- Check what policies currently exist on visitors table
SELECT 
    policyname,
    cmd,
    roles,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'visitors'
ORDER BY cmd, policyname;
