require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n🔍 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? '✓ Found' : '✗ Missing');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing credentials in .env file\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Check tenants table
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')
      .limit(5);

    if (tenantsError) {
      console.error('❌ Error fetching tenants:', tenantsError.message);
      console.log('\n💡 This likely means migrations haven\'t been run yet.');
      console.log('   Please run the migrations first using the MIGRATION_GUIDE.md\n');
      return;
    }

    console.log(`✅ Tenants table: ${tenants.length} rows found`);
    
    // Test 2: Check hosts table
    const { data: hosts, error: hostsError } = await supabase
      .from('hosts')
      .select('*')
      .limit(5);

    if (hostsError) {
      console.error('❌ Error fetching hosts:', hostsError.message);
      return;
    }

    console.log(`✅ Hosts table: ${hosts.length} rows found`);

    // Test 3: Check badges table
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select('*')
      .limit(5);

    if (badgesError) {
      console.error('❌ Error fetching badges:', badgesError.message);
      return;
    }

    console.log(`✅ Badges table: ${badges.length} rows found`);

    // Test 4: Check visitors table
    const { data: visitors, error: visitorsError } = await supabase
      .from('visitors')
      .select('*')
      .limit(5);

    if (visitorsError) {
      console.error('❌ Error fetching visitors:', visitorsError.message);
      return;
    }

    console.log(`✅ Visitors table: ${visitors.length} rows found`);

    console.log('\n✨ Connection test successful!\n');
    console.log('📊 Summary:');
    console.log(`   - Tenants: ${tenants.length} (should be 12)`);
    console.log(`   - Hosts: ${hosts.length}`);
    console.log(`   - Badges: ${badges.length} (should be 10)`);
    console.log(`   - Visitors: ${visitors.length}\n`);

    if (tenants.length > 0) {
      console.log('🏢 Sample tenant:');
      console.log(JSON.stringify(tenants[0], null, 2));
    }

  } catch (error) {
    console.error('\n❌ Connection test failed:', error.message);
    console.error(error);
  }
}

testConnection();
