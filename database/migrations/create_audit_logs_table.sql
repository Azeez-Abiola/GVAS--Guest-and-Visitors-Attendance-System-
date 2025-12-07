-- Create audit_logs table
-- This table stores all system audit events for tracking user actions and system changes
-- Run this in your Supabase SQL Editor

-- Drop table if it exists (to start fresh)
DROP TABLE IF EXISTS audit_logs CASCADE;

-- Create the table
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details TEXT,
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'critical')) DEFAULT 'info',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_email ON audit_logs(user_email);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy: Only admins can view audit logs
CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create policy: Authenticated users can insert their own audit logs
CREATE POLICY "Users can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE audit_logs IS 'Stores system audit trail for tracking user actions and system changes';

