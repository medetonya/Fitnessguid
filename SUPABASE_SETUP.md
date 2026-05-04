# Supabase Setup Guide for Fitness Guide

## Step 1: Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Project Name:** fitness-guide
   - **Database Password:** (generate a strong one, save it)
   - **Region:** Choose closest to your users (e.g., US East for US)
4. Click "Create new project" and wait 2-3 minutes for it to initialize

## Step 2: Get Your Credentials

Once the project is created:

1. Go to **Settings > API** (left sidebar)
2. You'll see:
   - **Project URL** → Copy to `VITE_SUPABASE_URL`
   - **anon public** → Copy to `VITE_SUPABASE_ANON_KEY`
3. Update your `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Create Database Tables

1. Go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy the entire SQL from `supabase-migrations.sql` (in your project)
4. Paste it into the SQL Editor
5. Click **"Run"** (green play button)

This creates all required tables with Row-Level Security.

### Critical: Per-user workout migration

To guarantee calendar checkmarks and per-user workout summaries in production:

1. Go to **SQL Editor** in Supabase
2. Open `MIGRATION_WORKOUT_PER_USER.sql` from this project
3. Run the whole file once

This migration ensures:
- `workout_sessions.session_type` and `workout_sessions.session_summary` exist
- RLS is enabled for `workout_sessions` and `workout_notes`
- owner-only policies are applied (`auth.uid() = user_id`)

## Step 4: Enable Email Authentication

1. Go to **Authentication > Providers** (left sidebar)
2. Find "Email" and click it
3. Toggle **"Enable Email provider"** ON
4. Leave other settings as default
5. Click **"Save"**

### Optional: Configure Email Templates

1. Go to **Authentication > Email Templates**
2. You can customize:
   - Confirmation email
   - Password reset email
   - Magic link email

For development, the defaults work fine.

## Step 5: Set Up Row-Level Security Policies

1. Go to **SQL Editor**
2. Create a **New Query**
3. Run `supabase-migrations.sql` if you have not already (it includes all RLS policies)
4. If needed, re-run the policy section from `supabase-migrations.sql`

**What this does:**
- `users` table: Users can only read their own profile, admins can read all
- `training_programs`: Everyone can read (public)
- `exercises`: Everyone can read (public)
- `workout_notes`: Each user can only read/write their own exercise notes
- `workout_sessions`: Each user can only read/write their own workout history
- Other tables: Protected appropriately

## Step 6: Create a Test Admin User

1. Go to **Authentication > Users**
2. Click **"Invite"**
3. Enter an email address (e.g., admin@test.com)
4. Click **"Send Invite"**
5. Check your email and click the confirmation link
6. Set a password

Then, to make them an admin:

1. Go to **SQL Editor**
2. Run this query:

```sql
UPDATE users 
SET role = 'admin', status = 'approved' 
WHERE email = 'admin@test.com';
```

## Step 7: Test the Connection

Update `.env.local` with your real credentials, then:

```bash
npm run dev
```

Visit http://localhost:5174

You should see:
- ✅ Home page loads
- ✅ Sign up button works
- ✅ Sign in button works
- ✅ No console errors about Supabase

## Testing Sign Up Flow

1. Click **"Create Account"** on home page
2. Enter: 
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "TestPassword123!"
3. Click **"Sign Up"**

**Expected:**
- ✅ User created in Supabase
- ✅ Redirects to home page
- ✅ Shows "Awaiting Approval" message
- ✅ No errors in browser console

## Testing Admin Approval

1. Go to **Authentication > Users** in Supabase Dashboard
2. Click on the user you just created
3. Look at the `users` table data
4. Run this SQL to approve them:

```sql
UPDATE users 
SET status = 'approved' 
WHERE email = 'test@example.com';
```

5. Refresh the app
6. **Expected:** Shows program listing instead of "Awaiting Approval"

## Testing Sign In Flow

1. Log out (if logged in)
2. Click **"Sign In"**
3. Enter your test user credentials
4. Click **"Sign In"**

**Expected:**
- ✅ Successfully signs in
- ✅ Shows dashboard with training programs
- ✅ Navbar shows user email

## Troubleshooting

### Error: "Missing Supabase credentials"
- ❌ `.env.local` not created or has wrong keys
- ✅ Solution: Copy exact values from Supabase Dashboard > Settings > API

### Error: "Invalid API key"
- ❌ Used wrong key (service_role instead of anon public)
- ✅ Solution: Use the "anon public" key under "Project API keys"

### Error: "Network error connecting to Supabase"
- ❌ Project URL is incorrect or doesn't have https://
- ✅ Solution: Check URL format: `https://xxx.supabase.co`

### User can see other users' data
- ❌ Row-Level Security policies weren't applied
- ✅ Solution: Re-run the RLS policy section from `supabase-migrations.sql`

### Sign up doesn't create user profile
- ❌ Database tables weren't created
- ✅ Solution: Run the migrations SQL (see `supabase-migrations.sql`)

## Next Steps

Once auth is working:
1. ✅ Authentication pages (DONE)
2. → Create Dashboard page (training programs)
3. → Create Admin Panel
4. → Deploy to Vercel

---

**Need help?** Check the `.env.local.example` file or review the SQL files in the project.
