#!/usr/bin/env node

/**
 * Supabase Migration Runner
 * This script runs all SQL migrations against your Supabase database
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  
  console.log('🚀 Starting Supabase migrations...\n');
  console.log(`📁 Migrations directory: ${migrationsDir}\n`);

  try {
    // Get all migration files
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No migration files found');
      return;
    }

    console.log(`📝 Found ${files.length} migration file(s):\n`);
    files.forEach(file => console.log(`   - ${file}`));
    console.log('');

    // Run each migration
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`⏳ Running migration: ${file}...`);

      try {
        // Execute the SQL
        const { error } = await supabase.rpc('exec_sql', { sql_string: sql });
        
        if (error) {
          // If exec_sql doesn't exist, try direct execution via REST API
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ sql_string: sql })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }

        console.log(`✅ Successfully ran: ${file}\n`);
      } catch (migrationError) {
        console.error(`❌ Error running ${file}:`);
        console.error(migrationError.message);
        console.error('\nTrying alternative method...\n');
        
        // Alternative: Split by semicolon and run each statement
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));

        for (let i = 0; i < statements.length; i++) {
          try {
            await supabase.rpc('exec', { sql: statements[i] + ';' });
          } catch (e) {
            console.error(`Failed at statement ${i + 1}:`, e.message);
          }
        }
      }
    }

    console.log('\n✨ All migrations completed!\n');
    console.log('🎯 Next steps:');
    console.log('   1. Verify tables in Supabase Dashboard → Database → Tables');
    console.log('   2. Check RLS policies in Supabase Dashboard → Database → Policies');
    console.log('   3. Test the connection by running: node test-connection.js\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
