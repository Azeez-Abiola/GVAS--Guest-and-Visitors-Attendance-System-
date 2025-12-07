# Supabase Migration Guide for GVAS

## Option 1: Using Supabase SQL Editor (RECOMMENDED - Easiest)

1. **Go to your Supabase project:**
   https://supabase.com/dashboard/project/xsauzkwkvzqrqqswswzx

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run migrations in order:**

   ### Step 1: Run Initial Schema
   - Copy the contents of `supabase/migrations/20241201000001_initial_schema.sql`
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - Wait for "Success" message

   ### Step 2: Run RLS Policies
   - Copy the contents of `supabase/migrations/20241201000002_rls_policies.sql`
   - Paste into a new query
   - Click "Run"
   - Wait for "Success" message

   ### Step 3: Run Functions
   - Copy the contents of `supabase/migrations/20241201000003_functions.sql`
   - Paste into a new query
   - Click "Run"
   - Wait for "Success" message

4. **Verify the migration:**
   - Go to "Database" → "Tables" in the left sidebar
   - You should see: tenants, hosts, badges, visitors, visitor_approvals, blacklist, notifications, audit_logs, badge_history

---

## Option 2: Using Supabase CLI (For Advanced Users)

### Install Supabase CLI
```bash
npm install -g supabase
```

### Login to Supabase
```bash
supabase login
```

### Link to your project
```bash
supabase link --project-ref xsauzkwkvzqrqqswswzx
```

### Run migrations
```bash
cd backend
supabase db push
```

---

## Option 3: Using psql (PostgreSQL CLI)

If you have PostgreSQL installed locally:

```bash
# Connect to your Supabase database
psql "postgresql://postgres.xsauzkwkvzqrqqswswzx:Ogakay223@@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# Once connected, run each migration file:
\i supabase/migrations/20241201000001_initial_schema.sql
\i supabase/migrations/20241201000002_rls_policies.sql
\i supabase/migrations/20241201000003_functions.sql
```

---

## Verification Checklist

After running the migrations, verify in Supabase Dashboard:

### ✅ Tables Created (Database → Tables)
- [ ] tenants (12 rows - UAC House floors)
- [ ] hosts (12+ rows - sample hosts)
- [ ] badges (10 rows - badge inventory)
- [ ] visitors (empty initially)
- [ ] visitor_approvals (empty initially)
- [ ] blacklist (empty initially)
- [ ] notifications (empty initially)
- [ ] audit_logs (empty initially)
- [ ] badge_history (empty initially)

### ✅ RLS Policies (Database → Policies)
- [ ] Each table should have multiple policies
- [ ] Policies should be enabled

### ✅ Functions (Database → Functions)
- [ ] generate_visitor_id()
- [ ] generate_guest_code()
- [ ] is_visitor_blacklisted()
- [ ] get_checked_in_visitors()
- [ ] assign_badge_to_visitor()
- [ ] approve_visitor()
- [ ] notify_host_of_arrival()
- [ ] And more...

---

## Troubleshooting

### Error: "relation already exists"
This means the table/function already exists. You can either:
- Drop the existing table/function and re-run
- Or skip that part of the migration

### Error: "permission denied"
Make sure you're using the connection string with the database password, not just the anon key.

### Can't connect to database
Double-check your connection string has the correct password: `Ogakay223@`

---

## Next Steps After Migration

1. **Install Supabase client in backend:**
   ```bash
   cd backend
   npm install @supabase/supabase-js dotenv
   ```

2. **Install Supabase client in frontend:**
   ```bash
   cd frontend
   npm install @supabase/supabase-js
   ```

3. **Test the connection:**
   Run the test script: `node backend/test-connection.js`

4. **Update the backend code** to use Supabase instead of SQLite

---

## Support

If you encounter any issues:
1. Check the Supabase logs (Dashboard → Logs)
2. Verify your credentials in .env files
3. Make sure RLS is properly configured
4. Check that you're using the SERVICE_ROLE_KEY for backend operations
