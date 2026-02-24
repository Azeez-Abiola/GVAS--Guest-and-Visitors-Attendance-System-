-- Fix for visitor count not updating in system_stats
-- 1. Ensure the stats table exists
CREATE TABLE IF NOT EXISTS system_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    active_organizations INTEGER DEFAULT 0,
    total_visitors_logged INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the internal calculation logic as a STANDARD function
-- This can be called both manually and by a trigger
CREATE OR REPLACE FUNCTION refresh_system_stats_internal()
RETURNS VOID AS $$
BEGIN
    INSERT INTO system_stats (id, total_revenue, active_organizations, total_visitors_logged, last_updated)
    SELECT 
        COALESCE((SELECT id FROM system_stats LIMIT 1), gen_random_uuid()),
        COALESCE((SELECT SUM(amount_paid) FROM system_subscriptions WHERE status = 'active'), 0),
        COALESCE((SELECT COUNT(*) FROM system_organizations WHERE status = 'active'), 0),
        COALESCE((SELECT COUNT(*) FROM visitors), 0),
        NOW()
    ON CONFLICT (id) DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        active_organizations = EXCLUDED.active_organizations,
        total_visitors_logged = EXCLUDED.total_visitors_logged,
        last_updated = EXCLUDED.last_updated;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the TRIGGER wrapper function
CREATE OR REPLACE FUNCTION update_system_stats_trigger_fn()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM refresh_system_stats_internal();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_stats_visitors ON visitors;

-- 5. Create the trigger using the wrapper function
CREATE TRIGGER trigger_update_stats_visitors
AFTER INSERT OR DELETE ON visitors
FOR EACH STATEMENT EXECUTE FUNCTION update_system_stats_trigger_fn();

-- 6. Manually run the internal function to sync current data
SELECT refresh_system_stats_internal();
