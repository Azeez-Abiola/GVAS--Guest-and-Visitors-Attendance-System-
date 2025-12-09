-- NUCLEAR OPTION: Remove ALL policies on visitors table and create one simple one

-- Drop ALL existing policies on visitors table
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'visitors') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON visitors';
    END LOOP;
END
$$;

-- Verify all policies are dropped
SELECT COUNT(*) as remaining_policies FROM pg_policies WHERE tablename = 'visitors';

-- Create ONE simple INSERT policy
CREATE POLICY "visitors_insert_policy"
    ON visitors
    FOR INSERT
    WITH CHECK (true);

-- Also ensure we have basic SELECT policies for users to view visitors
CREATE POLICY "visitors_select_policy"
    ON visitors
    FOR SELECT
    USING (true);

-- Verify the new policies
SELECT policyname, cmd, permissive FROM pg_policies WHERE tablename = 'visitors';
