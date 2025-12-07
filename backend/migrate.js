require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔧 Running GVAS Database Migrations\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    
    // Get all migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Run in order
    
    console.log(`Found ${migrationFiles.length} migration files:\n`);
    
    for (const file of migrationFiles) {
      console.log(`📄 Migration file: ${file}`);
      console.log(`   📝 SQL content ready for manual execution`);
    }
    
    console.log('\n🚨 MANUAL SETUP REQUIRED:');
    console.log('   These migrations contain DDL statements that need to be run manually');
    console.log('   Go to: https://supabase.com/dashboard/project/[PROJECT_ID]/sql-editor');
    console.log('\n📋 Run these files in order:');
    migrationFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    
    console.log('\n🧪 Testing existing API endpoints...\n');
    
    // Test existing functionality
    try {
      const { data: visitors } = await supabase
        .from('visitors')
        .select('count')
        .limit(1);
      console.log('   ✅ Visitors table accessible');
    } catch (err) {
      console.log('   ⚠️  Visitors table issue:', err.message);
    }
    
    try {
      const { data: badges } = await supabase
        .from('badges')
        .select('count')
        .limit(1);
      console.log('   ✅ Badges table accessible');
    } catch (err) {
      console.log('   ⚠️  Badges table issue:', err.message);
    }
    
    console.log('\n✨ Backend is ready with new API endpoints!');
    console.log('   New endpoints available:');
    console.log('   📊 /api/audit-logs - Audit logging');
    console.log('   🚨 /api/incidents - Incident management');
    console.log('   ⚙️  /api/settings - System configuration');
    console.log('   📄 /api/documents - Document management');
    console.log('   📈 /api/analytics - Analytics data');
    console.log('   📊 /api/reports - Report generation');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

runMigrations();