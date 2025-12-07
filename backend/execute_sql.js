const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://xsauzkwkvzqrqqswswzx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzYXV6a3drdnpxcnFxc3dzd3p4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzE0NzMzMSwiZXhwIjoyMDQ4NzIzMzMxfQ.THsqzCcYy0G2jvO-AO5qJy21f1I5j2XdRbHDZ2v1WT8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQLFile(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log('Executing SQL script:', filePath);
    console.log('SQL content length:', sql.length, 'characters');
    
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      
      // Try alternative: execute via REST API
      console.log('\nTrying alternative method...');
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ query: sql })
      });
      
      const result = await response.json();
      console.log('Alternative method result:', result);
    } else {
      console.log('SQL executed successfully!');
      console.log('Result:', data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

executeSQLFile('./supabase/fix_hosts_rls_recursion.sql');
