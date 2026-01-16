-- GVAS SUPER ADMIN MANAGEMENT SCHEMA
-- Purpose: Track organizations, subscriptions, and revenue for the GVAS platform owner.

-- 1. System Organizations (The clients/companies using GVAS)
CREATE TABLE IF NOT EXISTS system_organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    industry TEXT,
    location TEXT,
    contact_person TEXT NOT NULL,
    contact_email TEXT UNIQUE NOT NULL,
    contact_phone TEXT,
    logo_url TEXT,
    status TEXT CHECK (status IN ('active', 'inactive', 'suspended', 'trialing')) DEFAULT 'active',
    plan_tier TEXT CHECK (plan_tier IN ('standard', 'business', 'enterprise')) DEFAULT 'standard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. System Subscriptions (Payment history and tracking)
CREATE TABLE IF NOT EXISTS system_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES system_organizations(id) ON DELETE CASCADE,
    plan_tier TEXT NOT NULL,
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')) NOT NULL,
    amount_paid DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    payment_method TEXT, -- Paystack, Flutterwave, Manual, Bank Transfer
    transaction_reference TEXT UNIQUE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('active', 'expired', 'cancelled')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. System Analytics Snapshot (For the Super Admin Dashboard)
CREATE TABLE IF NOT EXISTS system_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    active_organizations INTEGER DEFAULT 0,
    total_visitors_logged INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Super Admin role to existing users if they aren't already there
-- Assuming there's a profiles or users table with roles. 
-- In this system, 'admin' is a building admin. We need 'super_admin'.

-- Enable RLS for Super Admin Tables
ALTER TABLE system_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_stats ENABLE ROW LEVEL SECURITY;

-- 4. Function to recalculate system stats
CREATE OR REPLACE FUNCTION update_system_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or Insert stats record
    -- We assume there's only one record for the overall system stats
    INSERT INTO system_stats (id, total_revenue, active_organizations, total_visitors_logged, last_updated)
    SELECT 
        COALESCE((SELECT id FROM system_stats LIMIT 1), gen_random_uuid()),
        (SELECT SUM(amount_paid) FROM system_subscriptions WHERE status = 'active'),
        (SELECT COUNT(*) FROM system_organizations WHERE status = 'active'),
        (SELECT COUNT(*) FROM visitors),
        NOW()
    ON CONFLICT (id) DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        active_organizations = EXCLUDED.active_organizations,
        total_visitors_logged = EXCLUDED.total_visitors_logged,
        last_updated = EXCLUDED.last_updated;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 5. Triggers to keep stats in sync
CREATE TRIGGER trigger_update_stats_org
AFTER INSERT OR UPDATE OR DELETE ON system_organizations
FOR EACH STATEMENT EXECUTE FUNCTION update_system_stats();

CREATE TRIGGER trigger_update_stats_sub
AFTER INSERT OR UPDATE OR DELETE ON system_subscriptions
FOR EACH STATEMENT EXECUTE FUNCTION update_system_stats();

-- Seed some initial sample data for the dashboard
INSERT INTO system_organizations (name, contact_person, contact_email, plan_tier, status)
VALUES 
('Hovidas Technologies', 'System Admin', 'dev@hovidastechnologies.com', 'enterprise', 'active'),
('UAC House', 'Azeez Abiola', 'azeez@uachouse.com', 'business', 'active'),
('Acme Finance', 'John Doe', 'john@acmefinance.com', 'standard', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO system_subscriptions (org_id, plan_tier, billing_cycle, amount_paid, start_date, expiry_date, status)
SELECT 
    id, 
    plan_tier, 
    'yearly', 
    CASE WHEN plan_tier = 'business' THEN 2500000 ELSE 1500000 END,
    NOW() - INTERVAL '3 months',
    NOW() + INTERVAL '9 months',
    'active'
FROM system_organizations
ON CONFLICT DO NOTHING;

-- Initial run to populate stats
SELECT update_system_stats();
