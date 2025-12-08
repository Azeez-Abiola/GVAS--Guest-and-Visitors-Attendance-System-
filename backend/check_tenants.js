require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTenants() {
    console.log('Checking tenants table schema...');
    const { data, error } = await supabase.from('tenants').select('*').limit(1);

    if (error) {
        console.log('Error:', error.message);
    } else {
        if (data.length > 0) {
            console.log('Tenants columns:', Object.keys(data[0]));
            console.log('Sample data:', data[0]);
        } else {
            console.log('Tenants table exists but is empty.');
        }
    }
}

checkTenants();
