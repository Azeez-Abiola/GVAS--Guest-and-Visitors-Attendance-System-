-- Helper Functions and Stored Procedures for GVAS
-- Migration: Database Functions
-- Date: 2024-12-01

-- =====================================================
-- VISITOR MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to get current checked-in visitors (for evacuation)
CREATE OR REPLACE FUNCTION get_checked_in_visitors()
RETURNS TABLE (
    visitor_id TEXT,
    name TEXT,
    host_name TEXT,
    floor_number INTEGER,
    badge_number TEXT,
    check_in_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.visitor_id,
        v.name,
        v.host_name,
        v.floor_number,
        v.badge_number,
        v.check_in_time
    FROM visitors v
    WHERE v.status = 'checked-in'
    ORDER BY v.floor_number, v.check_in_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unreturned badges
CREATE OR REPLACE FUNCTION get_unreturned_badges()
RETURNS TABLE (
    badge_id UUID,
    badge_number TEXT,
    visitor_name TEXT,
    visitor_id TEXT,
    issued_at TIMESTAMP WITH TIME ZONE,
    hours_overdue INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.badge_number,
        v.name,
        v.visitor_id,
        bh.issued_at,
        EXTRACT(HOUR FROM (NOW() - bh.issued_at))::INTEGER
    FROM badges b
    JOIN badge_history bh ON b.id = bh.badge_id
    JOIN visitors v ON bh.visitor_id = v.id
    WHERE b.status = 'issued'
    AND bh.returned_at IS NULL
    AND v.status IN ('checked-in', 'checked-out')
    ORDER BY bh.issued_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get visitor statistics by date range
CREATE OR REPLACE FUNCTION get_visitor_stats(
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    total_visitors BIGINT,
    walk_in_visitors BIGINT,
    pre_registered_visitors BIGINT,
    checked_in BIGINT,
    checked_out BIGINT,
    avg_visit_duration_minutes NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_visitors,
        COUNT(*) FILTER (WHERE qr_code IS NULL)::BIGINT as walk_in_visitors,
        COUNT(*) FILTER (WHERE qr_code IS NOT NULL)::BIGINT as pre_registered_visitors,
        COUNT(*) FILTER (WHERE status = 'checked-in')::BIGINT as checked_in,
        COUNT(*) FILTER (WHERE status = 'checked-out')::BIGINT as checked_out,
        AVG(
            EXTRACT(EPOCH FROM (check_out_time - check_in_time)) / 60
        )::NUMERIC(10,2) as avg_visit_duration_minutes
    FROM visitors
    WHERE created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get visitors by floor
CREATE OR REPLACE FUNCTION get_visitors_by_floor(
    p_floor_number INTEGER DEFAULT NULL,
    p_status TEXT DEFAULT NULL
)
RETURNS TABLE (
    floor_number INTEGER,
    tenant_name TEXT,
    visitor_count BIGINT,
    checked_in_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.floor_number,
        t.name as tenant_name,
        COUNT(v.id)::BIGINT as visitor_count,
        COUNT(v.id) FILTER (WHERE v.status = 'checked-in')::BIGINT as checked_in_count
    FROM tenants t
    LEFT JOIN visitors v ON t.id = v.tenant_id
    WHERE (p_floor_number IS NULL OR t.floor_number = p_floor_number)
    AND (p_status IS NULL OR v.status = p_status)
    AND v.created_at >= CURRENT_DATE
    GROUP BY t.floor_number, t.name
    ORDER BY t.floor_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- BADGE MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to assign badge to visitor
CREATE OR REPLACE FUNCTION assign_badge_to_visitor(
    p_visitor_id UUID,
    p_badge_type TEXT DEFAULT 'visitor',
    p_issued_by UUID DEFAULT NULL
)
RETURNS TABLE (
    badge_id UUID,
    badge_number TEXT,
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_badge_id UUID;
    v_badge_number TEXT;
BEGIN
    -- Get available badge of requested type
    SELECT id, badge_number INTO v_badge_id, v_badge_number
    FROM badges
    WHERE badge_type = p_badge_type
    AND status = 'available'
    LIMIT 1
    FOR UPDATE;

    IF v_badge_id IS NULL THEN
        RETURN QUERY SELECT NULL::UUID, NULL::TEXT, FALSE, 
            'No available ' || p_badge_type || ' badges'::TEXT;
        RETURN;
    END IF;

    -- Update badge status
    UPDATE badges
    SET status = 'issued',
        current_visitor_id = p_visitor_id,
        last_issued_at = NOW()
    WHERE id = v_badge_id;

    -- Update visitor with badge info
    UPDATE visitors
    SET badge_id = v_badge_id,
        badge_number = v_badge_number
    WHERE id = p_visitor_id;

    -- Record in badge history
    INSERT INTO badge_history (badge_id, visitor_id, issued_at, issued_by)
    VALUES (v_badge_id, p_visitor_id, NOW(), p_issued_by);

    RETURN QUERY SELECT v_badge_id, v_badge_number, TRUE, 
        'Badge assigned successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to return badge
CREATE OR REPLACE FUNCTION return_badge(
    p_badge_id UUID,
    p_condition TEXT DEFAULT 'good'
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) AS $$
BEGIN
    -- Update badge status
    UPDATE badges
    SET status = CASE 
            WHEN p_condition = 'damaged' THEN 'damaged'
            WHEN p_condition = 'lost' THEN 'lost'
            ELSE 'available'
        END,
        current_visitor_id = NULL
    WHERE id = p_badge_id;

    -- Update badge history
    UPDATE badge_history
    SET returned_at = NOW(),
        return_condition = p_condition
    WHERE badge_id = p_badge_id
    AND returned_at IS NULL;

    RETURN QUERY SELECT TRUE, 'Badge returned successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- APPROVAL WORKFLOW FUNCTIONS
-- =====================================================

-- Function to approve visitor
CREATE OR REPLACE FUNCTION approve_visitor(
    p_visitor_id UUID,
    p_approved_by UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) AS $$
BEGIN
    -- Update visitor approval status
    UPDATE visitors
    SET approval_status = 'approved'
    WHERE id = p_visitor_id;

    -- Record approval
    INSERT INTO visitor_approvals (visitor_id, status, approved_by, approved_at, notes)
    VALUES (p_visitor_id, 'approved', p_approved_by, NOW(), p_notes);

    -- Create notification for visitor
    INSERT INTO notifications (visitor_id, type, template, message, status)
    SELECT 
        p_visitor_id,
        'email',
        'approval_confirmation',
        'Your visit request has been approved',
        'pending'
    FROM visitors WHERE id = p_visitor_id AND email IS NOT NULL;

    RETURN QUERY SELECT TRUE, 'Visitor approved successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject visitor
CREATE OR REPLACE FUNCTION reject_visitor(
    p_visitor_id UUID,
    p_rejected_by UUID,
    p_reason TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) AS $$
BEGIN
    -- Update visitor approval status
    UPDATE visitors
    SET approval_status = 'rejected',
        status = 'cancelled'
    WHERE id = p_visitor_id;

    -- Record rejection
    INSERT INTO visitor_approvals (visitor_id, status, approved_by, approved_at, rejection_reason)
    VALUES (p_visitor_id, 'rejected', p_rejected_by, NOW(), p_reason);

    -- Create notification for visitor
    INSERT INTO notifications (visitor_id, type, template, message, status)
    SELECT 
        p_visitor_id,
        'email',
        'rejection_notification',
        'Your visit request has been declined: ' || p_reason,
        'pending'
    FROM visitors WHERE id = p_visitor_id AND email IS NOT NULL;

    RETURN QUERY SELECT TRUE, 'Visitor rejected'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- AUDIT LOGGING FUNCTION
-- =====================================================

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id UUID,
    p_user_email TEXT,
    p_user_role TEXT,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO audit_logs (
        user_id, user_email, user_role, action, 
        entity_type, entity_id, details
    )
    VALUES (
        p_user_id, p_user_email, p_user_role, p_action,
        p_entity_type, p_entity_id, p_details
    )
    RETURNING id INTO audit_id;

    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- NOTIFICATION FUNCTIONS
-- =====================================================

-- Function to create visitor arrival notification
CREATE OR REPLACE FUNCTION notify_host_of_arrival(
    p_visitor_id UUID
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
    v_visitor RECORD;
BEGIN
    SELECT v.*, h.email as host_email, h.phone as host_phone
    INTO v_visitor
    FROM visitors v
    JOIN hosts h ON v.host_id = h.id
    WHERE v.id = p_visitor_id;

    INSERT INTO notifications (
        visitor_id,
        host_id,
        type,
        template,
        recipient_email,
        recipient_phone,
        subject,
        message,
        status
    )
    VALUES (
        p_visitor_id,
        v_visitor.host_id,
        'email',
        'visitor_arrival',
        v_visitor.host_email,
        v_visitor.host_phone,
        'Guest Arrival: ' || v_visitor.name,
        v_visitor.name || ' has arrived at the reception desk and is waiting to meet you.',
        'pending'
    )
    RETURNING id INTO notification_id;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send invitation email
CREATE OR REPLACE FUNCTION send_visitor_invitation(
    p_visitor_id UUID
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
    v_visitor RECORD;
BEGIN
    SELECT * INTO v_visitor
    FROM visitors
    WHERE id = p_visitor_id;

    INSERT INTO notifications (
        visitor_id,
        type,
        template,
        recipient_email,
        subject,
        message,
        status
    )
    VALUES (
        p_visitor_id,
        'email',
        'visitor_invitation',
        v_visitor.email,
        'You are invited to visit ' || v_visitor.host_name,
        'Guest Code: ' || v_visitor.guest_code || '. Please use this code when you arrive.',
        'pending'
    )
    RETURNING id INTO notification_id;

    -- Update visitor
    UPDATE visitors
    SET invitation_sent = TRUE,
        invitation_sent_at = NOW()
    WHERE id = p_visitor_id;

    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_checked_in_visitors() IS 'Get all currently checked-in visitors for evacuation lists';
COMMENT ON FUNCTION get_unreturned_badges() IS 'Get all badges that have not been returned';
COMMENT ON FUNCTION assign_badge_to_visitor(UUID, TEXT, UUID) IS 'Assign an available badge to a visitor';
COMMENT ON FUNCTION return_badge(UUID, TEXT) IS 'Mark a badge as returned';
COMMENT ON FUNCTION approve_visitor(UUID, UUID, TEXT) IS 'Approve a pre-registered visitor';
COMMENT ON FUNCTION reject_visitor(UUID, UUID, TEXT) IS 'Reject a pre-registered visitor';
COMMENT ON FUNCTION notify_host_of_arrival(UUID) IS 'Send arrival notification to host';
COMMENT ON FUNCTION send_visitor_invitation(UUID) IS 'Send invitation email to visitor';
