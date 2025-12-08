require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanup() {
    console.log('Cleaning up hosts...');

    // 1. Get IDs of hosts to delete
    const { data: hostsToDelete, error: fetchError } = await supabase
        .from('hosts')
        .select('id, name')
        .not('name', 'ilike', 'adenuga%');

    if (fetchError) {
        console.error('Error fetching hosts:', fetchError);
        return;
    }

    if (!hostsToDelete || hostsToDelete.length === 0) {
        console.log('No hosts found to delete.');
        return;
    }

    const hostIds = hostsToDelete.map(h => h.id);
    console.log(`Found ${hostIds.length} hosts to delete:`, hostsToDelete.map(h => h.name));

    // 2. Delete visitors associated with these hosts
    console.log('Deleting associated visitors...');
    // We need to check if there are visitors before deleting to avoid errors if empty
    const { error: visitError, count: visitCount } = await supabase
        .from('visitors')
        .delete({ count: 'exact' })
        .in('host_id', hostIds);

    if (visitError) {
        console.error('Error deleting visitors:', visitError);
        // Continue anyway? No, might fail host delete.
    } else {
        console.log(`Deleted ${visitCount} visitors.`);
    }

    // 3. Delete the hosts
    console.log('Deleting hosts...');
    const { error: hostError, count: hostCount } = await supabase
        .from('hosts')
        .delete({ count: 'exact' })
        .in('id', hostIds);

    if (hostError) {
        console.error('Error cleaning up hosts:', hostError);
    } else {
        console.log(`Cleanup complete. Deleted ${hostCount} hosts.`);
    }
}

cleanup();
