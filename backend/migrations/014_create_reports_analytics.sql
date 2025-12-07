-- Migration: Create reports and analytics tables
-- Description: Store report definitions and cached analytics data

-- Report Templates
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL, -- visitor_analytics, badge_usage, security_incidents, etc.
    
    -- Report configuration
    query_config JSONB NOT NULL, -- SQL conditions, date ranges, etc.
    chart_config JSONB, -- Chart type, colors, labels, etc.
    
    -- Access control
    is_public BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated Reports (cached results)
CREATE TABLE generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    
    -- Report data
    data JSONB NOT NULL, -- The actual report results
    chart_data JSONB, -- Processed data for charts
    
    -- Parameters used to generate this report
    parameters JSONB,
    date_range_start DATE,
    date_range_end DATE,
    
    -- File exports
    pdf_path TEXT, -- Path to generated PDF
    excel_path TEXT, -- Path to generated Excel file
    
    -- Status
    status VARCHAR(20) DEFAULT 'completed', -- generating, completed, failed
    error_message TEXT,
    
    -- Metadata
    generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE -- For cache invalidation
);

-- Analytics Cache (for dashboard widgets)
CREATE TABLE analytics_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(200) NOT NULL UNIQUE,
    
    -- Cached data
    data JSONB NOT NULL,
    
    -- Cache metadata
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default report templates
INSERT INTO report_templates (name, description, report_type, query_config, chart_config, is_public) VALUES
(
    'Daily Visitor Summary',
    'Daily summary of visitor check-ins, check-outs, and badge usage',
    'visitor_analytics',
    '{"time_period": "daily", "metrics": ["total_visitors", "check_ins", "check_outs", "active_visitors", "badge_usage"]}'::jsonb,
    '{"chart_type": "line", "show_trend": true}'::jsonb,
    true
),
(
    'Weekly Security Report', 
    'Weekly summary of security incidents and access violations',
    'security_incidents',
    '{"time_period": "weekly", "include_incidents": true, "include_blacklist": true}'::jsonb,
    '{"chart_type": "bar", "group_by": "incident_type"}'::jsonb,
    false
),
(
    'Monthly Badge Utilization',
    'Monthly analysis of badge inventory and usage patterns',
    'badge_usage',
    '{"time_period": "monthly", "metrics": ["utilization_rate", "average_duration", "peak_usage"]}'::jsonb,
    '{"chart_type": "donut", "show_percentage": true}'::jsonb,
    true
),
(
    'Floor Occupancy Analysis',
    'Analysis of visitor distribution across building floors',
    'visitor_analytics', 
    '{"group_by": "floor", "metrics": ["visitor_count", "average_duration", "peak_times"]}'::jsonb,
    '{"chart_type": "heatmap", "show_floors": true}'::jsonb,
    true
);

-- Indexes
CREATE INDEX idx_report_templates_type ON report_templates(report_type);
CREATE INDEX idx_report_templates_public ON report_templates(is_public);
CREATE INDEX idx_generated_reports_template ON generated_reports(template_id);
CREATE INDEX idx_generated_reports_date_range ON generated_reports(date_range_start, date_range_end);
CREATE INDEX idx_generated_reports_generated_by ON generated_reports(generated_by);
CREATE INDEX idx_analytics_cache_key ON analytics_cache(cache_key);
CREATE INDEX idx_analytics_cache_expires ON analytics_cache(expires_at);

-- RLS Policies
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_cache ENABLE ROW LEVEL SECURITY;

-- Report Templates Access
CREATE POLICY "report_templates_admin_access" ON report_templates
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "report_templates_public_read" ON report_templates
    FOR SELECT USING (
        is_public = true AND auth.uid() IS NOT NULL
    );

CREATE POLICY "report_templates_creator_access" ON report_templates
    FOR ALL USING (created_by = auth.uid());

-- Generated Reports Access
CREATE POLICY "generated_reports_admin_access" ON generated_reports
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "generated_reports_creator_access" ON generated_reports
    FOR SELECT USING (generated_by = auth.uid());

-- Analytics Cache Access (all authenticated users can read)
CREATE POLICY "analytics_cache_read" ON analytics_cache
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "analytics_cache_admin_write" ON analytics_cache
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'reception'))
    );

-- Function to get or create analytics cache
CREATE OR REPLACE FUNCTION get_analytics_cache(
    p_cache_key TEXT,
    p_ttl_minutes INTEGER DEFAULT 60
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_data JSONB;
    v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Try to get non-expired cache
    SELECT data, expires_at INTO v_data, v_expires_at
    FROM analytics_cache
    WHERE cache_key = p_cache_key 
    AND expires_at > NOW();
    
    -- Return cached data if found and not expired
    IF v_data IS NOT NULL THEN
        RETURN v_data;
    END IF;
    
    -- Cache miss or expired - return null
    -- The calling code should generate fresh data and call set_analytics_cache
    RETURN NULL;
END;
$$;

-- Function to set analytics cache
CREATE OR REPLACE FUNCTION set_analytics_cache(
    p_cache_key TEXT,
    p_data JSONB,
    p_ttl_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO analytics_cache (cache_key, data, expires_at)
    VALUES (
        p_cache_key,
        p_data,
        NOW() + (p_ttl_minutes || ' minutes')::INTERVAL
    )
    ON CONFLICT (cache_key) 
    DO UPDATE SET
        data = EXCLUDED.data,
        expires_at = EXCLUDED.expires_at,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$;