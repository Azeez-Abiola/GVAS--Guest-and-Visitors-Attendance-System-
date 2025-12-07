# 🚀 GVAS Supabase Migration - Quick Start

## ✅ What's Been Set Up

1. **Environment Files Created:**
   - `backend/.env` - Your Supabase credentials (already configured)
   - `frontend/.env` - Frontend Supabase config (already configured)
   - Both `.env.example` files for reference

2. **Database Migrations Created:**
   - `20241201000001_initial_schema.sql` - Complete database schema with 9 tables
   - `20241201000002_rls_policies.sql` - Row Level Security policies
   - `20241201000003_functions.sql` - Helper functions and stored procedures

3. **Helper Scripts:**
   - `test-connection.js` - Test your Supabase connection
   - `MIGRATION_GUIDE.md` - Detailed migration instructions

---

## 📋 Next Steps (Do These Now!)

### Step 1: Install Supabase Dependencies

```bash
# In backend directory
cd backend
npm install @supabase/supabase-js dotenv

# In frontend directory  
cd ../frontend
npm install @supabase/supabase-js
```

### Step 2: Run Database Migrations

**EASIEST METHOD - Use Supabase Dashboard:**

1. Go to: https://supabase.com/dashboard/project/xsauzkwkvzqrqqswswzx
2. Click **"SQL Editor"** in left sidebar
3. Click **"New query"**
4. Copy and paste `backend/supabase/migrations/20241201000001_initial_schema.sql`
5. Click **"Run"** button
6. Repeat steps 3-5 for:
   - `20241201000002_rls_policies.sql`
   - `20241201000003_functions.sql`

### Step 3: Test the Connection

```bash
cd backend
node test-connection.js
```

You should see:
```
✅ Tenants table: 12 rows found
✅ Hosts table: 12 rows found  
✅ Badges table: 10 rows found
✅ Visitors table: 0 rows found
```

---

## 🗄️ Database Schema Overview

### Tables Created:

1. **tenants** - 12 companies on each floor of UAC House
2. **hosts** - Employees who can invite visitors
3. **badges** - Physical badge inventory (10 badges)
4. **visitors** - Main visitor records
5. **visitor_approvals** - Approval workflow tracking
6. **blacklist** - Restricted visitors
7. **notifications** - Email/SMS queue
8. **audit_logs** - Complete activity tracking
9. **badge_history** - Badge issuance/return history

### Key Features:

- ✅ Multi-tenant support (12 floors)
- ✅ Badge tracking and management
- ✅ Visitor approval workflow
- ✅ Email/SMS notifications
- ✅ Emergency evacuation lists
- ✅ Blacklist management
- ✅ Complete audit trail
- ✅ Row Level Security (RLS) enabled

---

## 🔐 Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Role-based access control (admin, host, reception, security)
- ✅ Service role key for backend operations
- ✅ Anon key for frontend (limited access)
- ✅ Audit logging for all actions

---

## 📝 Sample Data

The migrations automatically create:
- **12 tenants** - One for each floor of UAC House
- **12 hosts** - One sample host per tenant
- **10 badges** - Badge inventory (visitor, contractor, VIP, delivery)

---

## 🛠️ Troubleshooting

### "relation already exists" error
The table/function already exists. Safe to ignore if you're re-running migrations.

### "permission denied" error
Make sure you're using the SERVICE_ROLE_KEY in backend/.env, not the ANON_KEY.

### Connection timeout
Check your database password is correct: `Ogakay223@`

### Can't see tables in dashboard
Make sure you ran all 3 migration files in order.

---

## 📚 Documentation

- **Detailed Migration Guide:** `backend/MIGRATION_GUIDE.md`
- **Supabase Dashboard:** https://supabase.com/dashboard/project/xsauzkwkvzqrqqswswzx
- **Supabase Docs:** https://supabase.com/docs

---

## ⚠️ Important Notes

1. **Keep .env files secure** - They contain sensitive credentials
2. **Never commit .env to git** - Already protected by .gitignore
3. **Use SERVICE_ROLE_KEY in backend only** - It bypasses RLS
4. **Use ANON_KEY in frontend** - It enforces RLS policies
5. **Database password:** `Ogakay223@` (store securely!)

---

## 🎯 After Migration Success

Once migrations are successful, we'll:
1. Update backend server.js to use Supabase
2. Update frontend to use Supabase client
3. Add authentication system
4. Implement email notifications
5. Add all UAC House features

---

## 🆘 Need Help?

If you get stuck:
1. Check `MIGRATION_GUIDE.md` for detailed steps
2. Verify credentials in .env files
3. Check Supabase Dashboard → Logs for errors
4. Run `node test-connection.js` to diagnose

Let me know when migrations are successful and we'll continue! 🚀
