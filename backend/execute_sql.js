require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

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

const sqlFile = process.argv[2];
if (!sqlFile) {
  console.error('Please provide a SQL file path as an argument.');
  process.exit(1);
}

executeSQLFile(sqlFile);
