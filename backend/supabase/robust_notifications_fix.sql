-- Robust fix for notifications - avoiding column assumptions

-- 1. Grant INSERT to anon
GRANT INSERT ON notifications TO anon;

-- 2. Create permissive RLS policies (without checking specific columns)
DROP POLICY IF EXISTS "Allow public to create notifications" ON notifications;
CREATE POLICY "Allow public to create notifications"
    ON notifications
    FOR INSERT
    TO anon
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow staff to create notifications" ON notifications;
CREATE POLICY "Allow staff to create notifications"
    ON notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 3. Add user_id column if it doesn't exist
-- We use a DO block to safely add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'user_id') THEN
        ALTER TABLE notifications ADD COLUMN user_id UUID REFERENCES users(id);
    END IF;
END $$;
