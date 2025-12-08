CREATE TABLE IF NOT EXISTS floors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  number INTEGER NOT NULL UNIQUE,
  type TEXT DEFAULT 'general', -- general, maintenance, vip, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE floors ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access" ON floors FOR SELECT USING (true);
CREATE POLICY "Service Role full access" ON floors USING (true);

-- Seed initial data
INSERT INTO floors (name, number) VALUES
('Ground Floor', 0),
('1st Floor', 1),
('2nd Floor', 2),
('3rd Floor', 3),
('4th Floor', 4),
('5th Floor', 5),
('6th Floor', 6),
('7th Floor', 7),
('8th Floor', 8),
('9th Floor', 9)
ON CONFLICT (number) DO NOTHING;
