require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSettings() {
    console.log('Checking system_settings table schema...');
    const { data, error } = await supabase.from('system_settings').select('*').limit(1);

    if (error) {
        console.log('Error:', error.message);
    } else {
        console.log('Settings exists. Data:', data);
    }
}

checkSettings();
