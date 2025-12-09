-- Final RLS fix for notifications matching actual schema

-- 1. Grant INSERT to anon
GRANT INSERT ON notifications TO anon;

-- 2. Create proper RLS policies for the actual columns (user_id, is_read)
DROP POLICY IF EXISTS "Allow public to create notifications" ON notifications;
CREATE POLICY "Allow public to create notifications"
    ON notifications
    FOR INSERT
    TO anon
    WITH CHECK (true); -- Simply allow creation

DROP POLICY IF EXISTS "Allow staff to create notifications" ON notifications;
CREATE POLICY "Allow staff to create notifications"
    ON notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 3. Ensure SELECT policies exist so users can read their own notifications
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
CREATE POLICY "Users can view their notifications"
    ON notifications
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() 
        OR 
        (data->>'host_id')::uuid = auth.uid()
    );
