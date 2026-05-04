# Fitness Training Website - Development Guide

## Project Overview
A fitness training program selection website with:
- User authentication (email-based via Supabase)
- Training program catalog with exercises
- Admin panel for user management  
- Responsive web design (mobile-first)

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite
- **UI:** TailwindCSS v4 + shadcn/ui components
- **Routing:** React Router v6
- **Forms:** React Hook Form  
- **Backend & Auth:** Supabase (PostgreSQL + Auth + RLS)
- **Hosting:** Vercel + Supabase

## Project Structure
```
src/
├── components/       # Reusable React components
├── pages/           # Page components for routes
├── context/         # React Context (AuthContext)
├── hooks/           # Custom hooks (useAuth)
├── lib/             # Utilities & Supabase client
├── types/           # TypeScript type definitions
├── styles/          # Global & component CSS
├── App.tsx          # Main router setup
└── main.tsx         # Entry point

public/             # Static assets
dist/               # Build output
.env.local          # Environment variables (not in git)
```

## Development Commands
- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Setup Instructions

### 1. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in Supabase credentials:
```bash
cp .env.local.example .env.local
```

Get credentials from: https://supabase.com/dashboard

### 2. Database Setup
Create these tables in Supabase SQL Editor:

```sql
-- Users table (extends Supabase auth)
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text,
  role text not null default 'user',
  status text not null default 'pending',
  created_at timestamp with time zone default now()
);

-- Training Programs
create table training_programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration integer,
  difficulty text,
  image_url text,
  created_at timestamp with time zone default now()
);

-- Exercises
create table exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  video_url text,
  image_url text,
  created_at timestamp with time zone default now()
);

-- Program-Exercise mapping
create table program_exercises (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references training_programs(id) on delete cascade,
  exercise_id uuid references exercises(id) on delete cascade,
  "order" integer,
  sets integer,
  reps integer,
  created_at timestamp with time zone default now()
);

-- User Progress tracking
create table user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  program_id uuid references training_programs(id) on delete cascade,
  current_day integer default 1,
  status text default 'active',
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone
);
```

### 3. Enable Auth
- Go to Supabase Dashboard > Authentication > Providers
- Enable "Email" provider
- Configure email templates (optional)

### 4. Row Level Security (RLS)
Enable RLS on all tables and create policies:

```sql
-- Allow users to view programs (public read)
alter table training_programs enable row level security;
create policy "Programs are viewable by everyone"
  on training_programs for select using (true);

-- Allow users to see their own profile
alter table users enable row level security;
create policy "Users can read own profile"
  on users for select using (auth.uid() = id);

-- Allow admins to read all users
create policy "Admins can read all users"
  on users for select using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );
```

## Development Phases

### Phase 1: Authentication (Current)
- [ ] Sign up page with email/password
- [ ] Sign in page
- [ ] Forgot password flow
- [ ] Email verification (optional)
- [ ] User approval pending screen

### Phase 2: Dashboard
- [ ] Training programs catalog
- [ ] Program details page
- [ ] User profile page
- [ ] Current program tracking

### Phase 3: Admin Panel
- [ ] User management
- [ ] Approve/reject users
- [ ] Program management

### Phase 4: Polish & Deploy
- [ ] Mobile responsiveness
- [ ] Error handling & toasts
- [ ] Performance optimization
- [ ] Deploy to Vercel

## API Conventions
- All data queries go through `supabase` client in `src/lib/supabase.ts`
- Use React Query (SWR) for data fetching if expanding (not included yet)
- Server-side validation via RLS policies

## Component Guidelines
- Use TypeScript for all components
- Props must be typed (don't use `any`)
- Use Tailwind classes for styling (no CSS-in-JS)
- Extract repeated patterns into reusable components

## Debugging Tips
- Check browser console for React errors
- Check Supabase logs for auth/query errors
- Use React DevTools extension to inspect component state
- Test auth in incognito tab to avoid stored sessions

## Important Files
- `src/context/AuthContext.tsx` - Global auth state
- `src/lib/supabase.ts` - Supabase client setup
- `src/hooks/useAuth.ts` - Hook to access AuthContext
- `tailwind.config.js` - UI theme configuration
- `.env.local` - Secrets (never commit)

## Next Steps
1. Copy `.env.local.example` → `.env.local`
2. Fill in Supabase credentials
3. Run `npm run dev`
4. Create first page: SignUpPage
5. Connect to Supabase auth
