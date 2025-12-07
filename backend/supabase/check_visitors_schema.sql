-- Check visitors table schema
\d visitors

-- Show all columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'visitors'
ORDER BY ordinal_position;
