-- Simpler, more permissive RLS policy for testing

DROP POLICY IF EXISTS "Allow anonymous guest registration" ON visitors;
DROP POLICY IF EXISTS "Hosts and staff can create visitors" ON visitors;

-- Create ONE simple policy that allows inserts for both anon and authenticated
CREATE POLICY "Allow visitor creation"
    ON visitors 
    FOR INSERT
    WITH CHECK (true);  -- Temporarily allow all inserts

-- Note: This is very permissive for now. Once working, we can tighten to:
-- WITH CHECK (status IN ('pending', 'pre-registered') AND name IS NOT NULL AND email IS NOT NULL)
