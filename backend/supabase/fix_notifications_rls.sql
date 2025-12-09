-- Fix RLS for notifications to allow guest registration to create notifications

-- 1. Grant INSERT permission to anon
GRANT INSERT ON notifications TO anon;

-- 2. Create RLS policy for anon insert
CREATE POLICY "Allow public to create notifications"
    ON notifications
    FOR INSERT
    TO anon
    WITH CHECK (
        -- Only allow creating pending/unread notifications
        status IN ('pending', 'unread')
    );

-- 3. Also allow authenticated users (hosts/staff) to create notifications
CREATE POLICY "Allow staff to create notifications"
    ON notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 4. Improve the host_id foreign key issue
-- The notifications table refs hosts(id). 
-- But sometimes we want to notify a user who is NOT in hosts table (only in users table).
-- We can't insert a user_id into host_id column if it has a foreign key constraint to hosts table!
-- We need to drop the constraint or make it nullable and add a user_id column?
-- For now, let's just make the FK optional if it isn't already (it is nullable)
-- BUT if we insert a UUID that doesn't exist in hosts table, it will fail FK constraint.

-- Check if we can alter the constraint to be deferred or drop it?
-- Better: Add a user_id column to notifications for notifications to users who aren't in hosts table.

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);

-- Update RLS to allow inserting user_id
-- (Policy above ALREADY allows it because it checks "status", not specific columns)

-- Grant access to users table reference if needed (usually public)
