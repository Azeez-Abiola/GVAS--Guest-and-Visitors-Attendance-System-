-- Create incidents table
-- This table stores security incidents and their resolution status
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('active', 'investigating', 'resolved', 'closed')) DEFAULT 'active',
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  category TEXT, -- e.g., 'security', 'access', 'visitor', 'system'
  location TEXT,
  reported_by TEXT, -- user email
  assigned_to UUID REFERENCES users(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_to ON incidents(assigned_to);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE
    ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Create policy: Admins and security can view all incidents
CREATE POLICY "Admins and security can view all incidents"
  ON incidents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'security')
    )
  );

-- Create policy: Admins and security can insert incidents
CREATE POLICY "Admins and security can create incidents"
  ON incidents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'security')
    )
  );

-- Create policy: Admins and security can update incidents
CREATE POLICY "Admins and security can update incidents"
  ON incidents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'security')
    )
  );

-- Add comment for documentation
COMMENT ON TABLE incidents IS 'Stores security incidents and their resolution status';
