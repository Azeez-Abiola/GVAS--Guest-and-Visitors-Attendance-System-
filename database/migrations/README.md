# Database Migrations - Audit Logs & Incidents

## Overview
This folder contains SQL migration files to create the `audit_logs` and `incidents` tables in your Supabase database.

## How to Run These Migrations

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your GVAS project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Audit Logs Migration
1. Open the file: `create_audit_logs_table.sql`
2. Copy **ALL** the SQL code from that file
3. In the Supabase SQL Editor, click **New Query**
4. Paste the SQL code
5. Click **Run** or press `Ctrl+Enter`
6. You should see a success message

### Step 3: Run the Incidents Migration
1. Open the file: `create_incidents_table.sql`
2. Copy **ALL** the SQL code from that file
3. In the Supabase SQL Editor, click **New Query**
4. Paste the SQL code
5. Click **Run** or press `Ctrl+Enter`
6. You should see a success message

### Step 4: Verify Tables Were Created
1. In Supabase Dashboard, click **Table Editor** in the left sidebar
2. You should now see two new tables:
   - `audit_logs`
   - `incidents`

## What These Tables Do

### `audit_logs` Table
- Stores all system activities (user actions, security events, system changes)
- Used by the **Audit Logs** page in the admin panel
- Automatically tracks:
  - Who did what action
  - When it happened
  - What resource was affected
  - Severity level (info, warning, error, critical)

### `incidents` Table
- Stores security incidents and their resolution status
- Used by the **Incident Management** page in the admin panel
- Tracks:
  - Active incidents
  - Investigation progress
  - Resolution notes
  - Assignment to security personnel

## After Running Migrations

Once you've run both SQL files in Supabase:

1. **Audit Logs page** will start showing real data (currently empty)
2. **Incident Management page** will start showing real data (currently empty)
3. The system will begin logging activities automatically

## Troubleshooting

**Error: "relation already exists"**
- This means the table is already created. You're good to go!

**Error: "permission denied"**
- Make sure you're logged in as the database owner in Supabase

**Error: "column does not exist"**
- Make sure the `users` table exists first (it should already exist in your database)

## Security

Both tables have Row Level Security (RLS) enabled:
- **Audit Logs**: Only admins can view
- **Incidents**: Only admins and security personnel can view/manage
