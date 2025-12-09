-- Comprehensive fix for public guest registration
-- This ensures anonymous users can register as guests

-- Step 1: Grant INSERT permission to anon role (public/unauthenticated users)
GRANT INSERT ON visitors TO anon;

-- Step 2: Ensure the public guest registration policy exists
-- First drop it if it exists to avoid conflicts
DROP POLICY IF EXISTS "Allow public guest registration" ON visitors;

-- Recreate the policy
CREATE POLICY "Allow public guest registration"
    ON visitors FOR INSERT
    TO anon  -- Specifically for anonymous users
    WITH CHECK (
        -- Allow insert if:
        -- 1. The visitor is being created with an allowed status
        -- 2. Required fields are provided
        status IN ('pending', 'pending_approval', 'pre-registered')
        AND name IS NOT NULL
        AND email IS NOT NULL
        AND host_id IS NOT NULL
    );

-- Step 3: Ensure authenticated users can also insert (for hosts creating visitors)
DROP POLICY IF EXISTS "Authenticated users can create visitors" ON visitors;

CREATE POLICY "Authenticated users can create visitors"
    ON visitors FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Authenticated users must be active
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND is_active = TRUE
        )
    );

-- Step 4: Verify RLS is enabled (should already be, but let's make sure)
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Note: After running this, test the guest registration form
-- The anon role (unauthenticated users) should now be able to insert visitor records
