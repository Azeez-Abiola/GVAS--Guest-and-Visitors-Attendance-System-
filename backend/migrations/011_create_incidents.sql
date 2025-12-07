-- Migration: Create incidents table
-- Description: Track security incidents and investigations

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_number VARCHAR(20) UNIQUE NOT NULL, -- Auto-generated: INC-YYYY-NNNN
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    incident_type VARCHAR(50) NOT NULL, -- security_breach, visitor_issue, badge_lost, unauthorized_access, etc.
    severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    status VARCHAR(20) NOT NULL DEFAULT 'open', -- open, investigating, resolved, closed
    location VARCHAR(100), -- Floor, room, area
    reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL, -- If incident involves a visitor
    badge_id UUID REFERENCES badges(id) ON DELETE SET NULL, -- If incident involves a badge
    
    -- Photo evidence
    evidence_photos TEXT[], -- Array of image URLs/paths
    
    -- Timeline
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Investigation details
    investigation_notes TEXT,
    resolution_notes TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date DATE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-generate incident numbers
CREATE SEQUENCE incident_counter;

CREATE OR REPLACE FUNCTION generate_incident_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    year_part TEXT;
    sequence_part TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    sequence_part := LPAD(nextval('incident_counter')::TEXT, 4, '0');
    RETURN 'INC-' || year_part || '-' || sequence_part;
END;
$$;

-- Trigger to auto-generate incident number
CREATE OR REPLACE FUNCTION set_incident_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.incident_number IS NULL OR NEW.incident_number = '' THEN
        NEW.incident_number := generate_incident_number();
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_incident_number
    BEFORE INSERT OR UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION set_incident_number();

-- Indexes
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_type ON incidents(incident_type);
CREATE INDEX idx_incidents_reported_by ON incidents(reported_by);
CREATE INDEX idx_incidents_assigned_to ON incidents(assigned_to);
CREATE INDEX idx_incidents_occurred_at ON incidents(occurred_at DESC);
CREATE INDEX idx_incidents_visitor_id ON incidents(visitor_id);

-- RLS Policies
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- Security and admin can see all incidents
CREATE POLICY "incidents_security_admin_access" ON incidents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('security', 'admin')
        )
    );

-- Users can see incidents they reported
CREATE POLICY "incidents_reporter_access" ON incidents
    FOR SELECT USING (reported_by = auth.uid());

-- Users can see incidents assigned to them
CREATE POLICY "incidents_assignee_access" ON incidents
    FOR SELECT USING (assigned_to = auth.uid());