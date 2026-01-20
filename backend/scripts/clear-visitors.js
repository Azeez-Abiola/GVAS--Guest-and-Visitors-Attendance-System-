require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearVisitors() {
    console.log('Clearing all visitor data...');

    try {
        // 1. Reset all badge statuses to available
        console.log('Resetting badge statuses...');
        const { error: badgeError } = await supabase
            .from('badges')
            .update({
                status: 'available',
                current_visitor_id: null,
                last_issued_at: null
            })
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Targeted all rows

        if (badgeError) {
            console.warn('Warning: Could not reset badges:', badgeError.message);
        } else {
            console.log('Badge statuses reset successfully.');
        }

        // 2. Delete all rows from visitors table
        console.log('Deleting visitors...');
        const { error: visitorError } = await supabase
            .from('visitors')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (visitorError) {
            throw visitorError;
        }

        console.log('Successfully cleared all visitor data.');
    } catch (error) {
        console.error('Error clearing data:', error);
        process.exit(1);
    }
}

clearVisitors();
