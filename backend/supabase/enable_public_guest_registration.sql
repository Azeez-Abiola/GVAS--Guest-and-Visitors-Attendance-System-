-- Allow public guest registration
-- This policy allows unauthenticated users to create visitor records
-- which is necessary for the guest self-registration form

-- Add policy for public/anonymous inserts on visitors table
CREATE POLICY "Allow public guest registration"
    ON visitors FOR INSERT
    WITH CHECK (
        -- Allow insert if:
        -- 1. The visitor is being created with status 'pending' or 'pending_approval'
        -- 2. Required fields are provided
        status IN ('pending', 'pending_approval', 'pre-registered')
        AND name IS NOT NULL
        AND email IS NOT NULL
        AND host_id IS NOT NULL
    );

-- Note: This policy allows anonymous users to create visitors
-- The existing "Hosts can create visitors" policy allows authenticated users to create visitors
-- Both policies can coexist - PostgreSQL will allow the operation if ANY policy permits it
