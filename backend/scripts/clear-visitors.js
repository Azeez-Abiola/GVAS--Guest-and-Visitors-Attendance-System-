require('dotenv').config({ path: '../.env' });
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
        // Delete all rows from visitors table
        const { error } = await supabase
            .from('visitors')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows where id is not an impossible UUID (effectively all)

        if (error) {
            throw error;
        }

        console.log('Successfully cleared all visitor data.');
    } catch (error) {
        console.error('Error clearing visitor data:', error);
        process.exit(1);
    }
}

clearVisitors();
