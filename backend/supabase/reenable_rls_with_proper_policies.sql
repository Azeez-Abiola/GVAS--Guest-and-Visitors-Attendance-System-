-- Re-enable RLS and create a proper policy for guest registration

-- Step 1: Re-enable RLS
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop the overly permissive test policy
DROP POLICY IF EXISTS "Anyone can create visitors" ON visitors;

-- Step 3: Create a proper policy for anonymous guest registration
CREATE POLICY "Allow anonymous guest registration"
    ON visitors 
    FOR INSERT
    TO anon
    WITH CHECK (
        -- Only allow certain status values for guest registration
        status IN ('pending', 'pre-registered')
        AND name IS NOT NULL
        AND email IS NOT NULL
        AND host_id IS NOT NULL
    );

-- Step 4: Keep the policy for authenticated users
DROP POLICY IF EXISTS "Hosts and staff can create visitors" ON visitors;

CREATE POLICY "Hosts and staff can create visitors"
    ON visitors 
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Authenticated users can create visitors
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND is_active = TRUE
        )
    );

-- Note: These policies work together with GRANT permissions already applied
-- Both anon and authenticated roles already have INSERT permission granted
