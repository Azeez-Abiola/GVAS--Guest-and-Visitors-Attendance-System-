-- GO-LIVE CLEANUP SCRIPT (Ultra-Safe Version)
-- Purpose: Clear all visitation history, notifications, and logs to start fresh.
-- This version uses dynamic SQL to prevent errors even if some tables do not exist.

DO $$ 
DECLARE
    tab_name text;
BEGIN
    -- List of tables to clear if they exist
    FOR tab_name IN SELECT unnest(ARRAY['visitors', 'notifications', 'audit_logs', 'incidents', 'blacklist_logs'])
    LOOP
        IF EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = tab_name
        ) THEN
            EXECUTE format('TRUNCATE TABLE %I CASCADE', tab_name);
            RAISE NOTICE 'Table % cleared successfully.', tab_name;
        ELSE
            RAISE NOTICE 'Table % does not exist, skipping.', tab_name;
        END IF;
    END LOOP;
END $$;

-- Summary Check (Safe)
SELECT 
    table_name, 
    (xpath('/row/cnt/text()', xml_count))[1]::text::int as row_count
FROM (
  SELECT 
    table_name,
    query_to_xml(format('SELECT count(*) as cnt FROM %I', table_name), false, true, '') as xml_count
  FROM information_schema.tables
  WHERE table_schema = 'public' 
  AND table_name IN ('visitors', 'notifications', 'audit_logs', 'incidents')
) stats;
