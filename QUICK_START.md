# 🚀 Quick Start Guide - Fitness Guide

## ⏱️ 5-Minute Setup

### Step 1: Create Supabase Project (2 min)
1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Name: `fitness-guide`
4. Region: closest to you
5. Generate password and click **"Create new project"**
6. Wait for it to initialize (~2-3 min)

### Step 2: Get Your Credentials (1 min)
1. Click **Settings > API** on the left sidebar
2. Copy these two values:
   - **Project URL**
   - **anon public** (under "Project API keys")

### Step 3: Update `.env.local` (1 min)
```bash
# Open .env.local and replace with your real credentials:
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 4: Setup Database (1 min)
1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Open `supabase-migrations.sql` from this project and copy ALL the SQL
4. Paste into the SQL Editor
5. Click the **"Run"** button (green play icon)
6. ✅ Done! Tables are created with security enabled

### Step 5: Enable Email Auth (30 sec)
1. Go to **Authentication > Providers**
2. Find "Email" and toggle **"Enable Email provider"** ON
3. Click **"Save"**

---

## 🧪 Test the Auth System

### Start the App
```bash
npm run dev
```

Visit: `http://localhost:5174`

You should see a **✅ Supabase Connected** notification in the bottom right!

### Test Flow 1: Sign Up
1. Click **"Create Account"**
2. Fill in:
   - Name: `Test User`
   - Email: `pavlovna166+test1@gmail.com`
   - Password: `TestPass123!`
3. Click **"Sign Up"**
4. **Expected:** See "Awaiting Approval" message on home page

### Test Flow 2: Admin Approval
1. Keep app open
2. Go to Supabase Dashboard → **Authentication > Users**
3. Find `pavlovna166+test1@gmail.com` user
4. Go to **SQL Editor > New Query** and run:
```sql
UPDATE users 
SET status = 'approved' 
WHERE email = 'pavlovna166+test1@gmail.com';
```
5. Refresh the app
6. **Expected:** Now see training programs instead of "Awaiting Approval"

### Test Flow 3: Sign In
1. Log out (click "Sign Out" button)
2. Click **"Sign In"**
3. Enter:
   - Email: `pavlovna166+test1@gmail.com`
   - Password: `TestPass123!`
4. **Expected:** Successfully logged in, see programs

### Test Flow 4: Create Admin User
```sql
-- Run in Supabase SQL Editor
UPDATE users 
SET role = 'admin', status = 'approved' 
WHERE email = 'pavlovna166+test1@gmail.com';
```

Then sign in again and check navbar for **"Admin Panel"** link (will build next phase).

---

## ✅ Testing Checklist

- [ ] Supabase connected (green ✅ notification)
- [ ] Can sign up with valid email/password
- [ ] User shows in Supabase → Users table
- [ ] Approval status changes after SQL update
- [ ] Can sign in after approval
- [ ] Can sign out
- [ ] Forgot password link works (sends email)
- [ ] Home page shows different UI for auth/not auth/pending/approved

---

## 🐛 Troubleshooting

### ❌ "Supabase Not Connected" (bottom right)
**Problem:** Wrong `.env.local` credentials

**Fix:**
1. Check `.env.local` exists in project root
2. Verify URL format: `https://xxx.supabase.co`
3. Make sure you're using "anon public" key, not "service_role"
4. Restart dev server: `npm run dev`

### ❌ Sign up fails with "user already exists"
**Problem:** Account already exists in database

**Fix:**
```sql
-- Delete the user from auth (in Supabase Dashboard)
-- OR use new email like test2@example.com
```

### ❌ Invalid login credentials (while Confirm email is OFF)
**Problem:** Usually wrong password, wrong email, or old test user with unknown password

**Fix:**
1. Use a brand new email alias (example: `pavlovna166+test2@gmail.com`)
2. Register again with `TestPass123!`
3. If needed, open incognito window and retry sign in

### ❌ "Awaiting Approval" won't change even after SQL update
**Problem:** Cached authentication

**Fix:**
1. Sign out
2. Clear browser cookies (or use incognito)
3. Sign in again

### ❌ No users showing in Supabase Dashboard
**Problem:** Database tables don't exist

**Fix:**
1. Go to **SQL Editor**
2. Paste and run `supabase-migrations.sql`
3. Check **Database > Tables** on the left

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `SUPABASE_SETUP.md` | Detailed setup documentation |
| `supabase-migrations.sql` | Database schema & RLS policies |
| `.env.local.example` | Template for environment variables |
| `src/lib/supabase.ts` | Supabase client configuration |
| `src/context/AuthContext.tsx` | Auth state management |

---

## 🎯 What's Working  

✅ User Registration (email/password)  
✅ User Login  
✅ Password Reset (email)  
✅ User Approval System  
✅ Admin Role Support  
✅ Row-Level Security (data protection)  
✅ Session Management  

---

## 📋 Next: Build Dashboard

Once auth is fully tested, ready to build:
1. **DashboardPage** - Show training programs
2. **ProgramDetailPage** - Program exercises
3. **AdminPage** - Manage users & programs

Run: `npm run dev` and start testing! 🎉
