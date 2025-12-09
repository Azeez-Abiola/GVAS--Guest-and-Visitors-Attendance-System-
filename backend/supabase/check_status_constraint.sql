-- Check the status constraint on visitors table
SELECT 
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'visitors'
AND con.contype = 'c'  -- Check constraints
AND con.conname LIKE '%status%';
