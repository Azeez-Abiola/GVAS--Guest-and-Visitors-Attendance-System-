require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
    console.log('Checking for floors table...');
    const { data, error } = await supabase.from('floors').select('*').limit(1);

    if (error) {
        console.log('Error accessing floors table (likely doesnt exist):', error.message);

        // Check if we can create it using SQL if users want me to, but first let's see current state.
        // I can't easily list all tables without SQL access or privilege info sometimes.
        // relying on the error message to confirm non-existence.
    } else {
        console.log('Floors table exists. Sample data:', data);
    }
}

checkTables();
