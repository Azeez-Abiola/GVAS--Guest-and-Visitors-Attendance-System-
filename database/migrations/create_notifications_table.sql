-- Migration: Create notifications table
-- Description: Store real-time notifications for receptionist check-in alerts
-- Date: 2025-12-05

-- Drop table if exists (for clean migration)
DROP TABLE IF EXISTS notifications CASCADE;

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Add comments
COMMENT ON TABLE notifications IS 'Stores system notifications for users, primarily for receptionist check-in alerts';
COMMENT ON COLUMN notifications.user_id IS 'The user who should receive this notification';
COMMENT ON COLUMN notifications.type IS 'Type of notification: visitor_checkin, visitor_checkout, system_alert, etc.';
COMMENT ON COLUMN notifications.title IS 'Short notification title';
COMMENT ON COLUMN notifications.message IS 'Detailed notification message';
COMMENT ON COLUMN notifications.data IS 'JSON payload with notification-specific data (visitor info, access code, etc.)';
COMMENT ON COLUMN notifications.is_read IS 'Whether the notification has been read';
COMMENT ON COLUMN notifications.read_at IS 'Timestamp when notification was marked as read';

-- Create indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at DESC) WHERE is_read = false;

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: System can insert notifications (service role)
CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Example notification data structure:
-- {
--   "visitor_id": "uuid",
--   "visitor_name": "John Doe",
--   "access_code": "ABC123",
--   "floor": "3",
--   "host_name": "Jane Smith",
--   "photo_url": "https://...",
--   "purpose": "Meeting"
-- }
