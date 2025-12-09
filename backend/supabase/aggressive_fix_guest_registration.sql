-- AGGRESSIVE FIX: Remove all existing INSERT policies and create one simple policy
-- This will allow both anonymous and authenticated users to insert visitors

-- Step 1: Drop ALL existing INSERT policies on visitors table
DROP POLICY IF EXISTS "Allow public guest registration" ON visitors;
DROP POLICY IF EXISTS "Hosts can create visitors" ON visitors;
DROP POLICY IF EXISTS "Authenticated users can create visitors" ON visitors;
DROP POLICY IF EXISTS "Reception can manage visitors" ON visitors;

-- Step 2: Grant INSERT to both anon and authenticated roles
GRANT INSERT ON visitors TO anon;
GRANT INSERT ON visitors TO authenticated;

-- Step 3: Create ONE comprehensive INSERT policy for everyone
CREATE POLICY "Anyone can create visitors"
    ON visitors 
    FOR INSERT
    WITH CHECK (true);  -- Allow all inserts (we'll tighten this later if needed)

-- Step 4: Keep the existing SELECT policies for viewing visitors
-- (Don't touch those, they're working fine)

-- Step 5: Verify RLS is enabled
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: This is a very permissive policy for testing
-- Once guest registration works, we can tighten it to:
-- WITH CHECK (
--     status IN ('pending', 'pending_approval', 'pre-registered')
--     AND name IS NOT NULL
--     AND email IS NOT NULL
-- );
