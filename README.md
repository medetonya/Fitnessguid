# MEDETOLAB 💪

A modern, full-featured fitness training program platform built with React, TypeScript, and Supabase.

## 🚀 Features

- **User Authentication** - Email-based signup/signin with password reset
- **User Approval System** - Admin approves new user signups
- **Training Programs** - Browse and select from fitness programs
- **Admin Panel** - Manage users, programs, and exercises
- **Real-time Database** - Supabase PostgreSQL with Row-Level Security
- **Responsive Design** - Works on desktop and mobile devices
- **TypeScript** - Fully type-safe React application

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** TailwindCSS v4
- **Routing:** React Router v6
- **Forms:** React Hook Form
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Hosting:** Vercel (ready to deploy)

## 📋 Quick Start

### 1. Clone & Install
```bash
npm install
```

### 2. Setup Supabase
See `QUICK_START.md` for detailed setup (5 minutes):
```
1. Create Supabase project
2. Get credentials
3. Update .env.local
4. Run SQL migrations
```

### 3. Start Development
```bash
npm run dev
```

Visit: `http://localhost:5173`

## 📁 Project Structure

```
src/
├── pages/              # Page components
│   ├── HomePage.tsx           # Landing page
│   ├── SignUpPage.tsx         # User registration
│   ├── SignInPage.tsx         # User login
│   └── ForgotPasswordPage.tsx # Password reset
├── components/         # Reusable components
│   ├── ProtectedRoute.tsx     # Route protection
│   └── SupabaseStatus.tsx     # Connection status
├── context/            # React Context
│   └── AuthContext.tsx        # Authentication state
├── hooks/              # Custom hooks
│   └── useAuth.ts             # Auth hook
├── lib/                # Utilities
│   └── supabase.ts            # Supabase client
├── types/              # TypeScript types
│   └── index.ts               # Type definitions
├── styles/             # CSS
│   └── globals.css            # Global styles
└── App.tsx             # Router & main layout
```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup guide
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Detailed Supabase documentation
- **[ADMIN_COMMANDS.sql](./ADMIN_COMMANDS.sql)** - Admin SQL queries

## 🔧 Available Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code quality
npm run lint         # Run ESLint
```

## 🔐 Environment Variables

Create `.env.local` in the project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

See `.env.local.example` for reference.

## 🧪 Testing

### Test Sign Up
1. Go to `/signup`
2. Fill in name, email, password
3. Submit form
4. See "Awaiting Approval" screen

### Test Admin Approval
1. Go to Supabase Dashboard
2. Run SQL: `UPDATE users SET status = 'approved' WHERE email = 'your@email.com'`
3. Refresh app
4. See training programs

### Test Sign In
1. Go to `/signin`
2. Enter credentials
3. Successfully logged in

See `QUICK_START.md` for complete testing guide.

## 🗄️ Database Schema

Tables:
- `users` - User profiles with role & approval status
- `training_programs` - Fitness programs
- `exercises` - Individual exercises
- `program_exercises` - Exercise lists for each program
- `user_progress` - Track user progress

See `supabase-migrations.sql` for full schema.

## 🔒 Security

- **Row-Level Security (RLS):** All data protected with database-level policies
- **Authentication:** Supabase Auth handles email/password securely
- **Role-Based Access:** User and Admin roles with enforced permissions
- **TypeScript:** Type-safe code prevents common vulnerabilities

## 📈 Development Roadmap

### ✅ Phase 1: Authentication (COMPLETE)
- [x] Sign up page
- [x] Sign in page
- [x] Forgot password
- [x] User approval system

### 🔄 Phase 2: Dashboard (Next)
- [ ] Training programs listing
- [ ] Program details page
- [ ] User profile page
- [ ] Program selection

### 🔜 Phase 3: Admin Panel
- [ ] User management
- [ ] Program management
- [ ] Statistics & reporting

### 📦 Phase 4: Deployment
- [ ] Deploy to Vercel
- [ ] Setup CI/CD
- [ ] Production monitoring

## 🚀 Deploy to Vercel

1. Push to GitHub
2. Go to https://vercel.com
3. Import project
4. Add environment variables
5. Deploy!

See [Vercel Documentation](https://vercel.com/docs) for details.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit PR

## 📝 License

MIT - Feel free to use for personal or commercial projects

## 🆘 Troubleshooting

### "Supabase Not Connected"
→ Check `.env.local` credentials

### Sign up fails
→ Check Supabase console for errors

### Database errors
→ Run `supabase-migrations.sql` again

See `QUICK_START.md` for more troubleshooting.

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review error messages in browser console
3. Check Supabase Dashboard logs

---

**Ready to build the next big fitness platform?** Start with `npm run dev` 🎉
