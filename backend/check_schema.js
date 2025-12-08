require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
    console.log('Checking badges table schema...');

    // Try to fetch one record
    const { data, error } = await supabase
        .from('badges')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching badges:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Available columns:', Object.keys(data[0]));
    } else {
        console.log('No badges found to interpret schema, trying to insert a dummy to see error details or lack thereof? No, that is risky.');
        // We can assume the error was correct.
        console.log('No rows in badges table.');
    }
}

checkSchema();
