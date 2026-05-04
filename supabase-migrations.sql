-- Fitness Guide Database Schema
-- Run this in Supabase SQL Editor to create all tables and RLS policies

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  preferred_language TEXT CHECK (preferred_language IN ('en', 'ru')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS preferred_language TEXT CHECK (preferred_language IN ('en', 'ru'));

-- Training Programs table
CREATE TABLE IF NOT EXISTS training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- days
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Program-Exercise mapping
CREATE TABLE IF NOT EXISTS program_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  sets INTEGER NOT NULL DEFAULT 3,
  reps INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(program_id, exercise_id)
);

-- User Progress tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  current_day INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, program_id)
);

-- Per-user workout notes (history/comments per exercise)
CREATE TABLE IF NOT EXISTS workout_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('builder', 'fat-loss', 'tone')),
  program_label TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- Per-user workout completion history
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('builder', 'fat-loss', 'tone')),
  source_key TEXT NOT NULL,
  title TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  session_type TEXT NOT NULL DEFAULT 'circuit' CHECK (session_type IN ('circuit', 'sets')),
  session_summary TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'skipped')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Per-user saved custom workouts from builder
CREATE TABLE IF NOT EXISTS custom_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  mode_preset TEXT NOT NULL CHECK (mode_preset IN ('fat-loss', 'tone')),
  execution_mode TEXT NOT NULL CHECK (execution_mode IN ('reps', 'timer')),
  selected_exercises JSONB NOT NULL,
  source_path TEXT NOT NULL,
  training_path TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, storage_key)
);

ALTER TABLE workout_sessions
  ADD COLUMN IF NOT EXISTS session_type TEXT NOT NULL DEFAULT 'circuit' CHECK (session_type IN ('circuit', 'sets'));

ALTER TABLE workout_sessions
  ADD COLUMN IF NOT EXISTS session_summary TEXT;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_training_programs_difficulty ON training_programs(difficulty);
CREATE INDEX IF NOT EXISTS idx_program_exercises_program_id ON program_exercises(program_id);
CREATE INDEX IF NOT EXISTS idx_program_exercises_exercise_id ON program_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_program_id ON user_progress(program_id);
CREATE INDEX IF NOT EXISTS idx_workout_notes_user_id ON workout_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_notes_updated_at ON workout_notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_completed_at ON workout_sessions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_workouts_user_id ON custom_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_workouts_created_at ON custom_workouts(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Keep the primary owner account as admin permanently
CREATE OR REPLACE FUNCTION enforce_primary_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  IF lower(NEW.email) = 'apavlovna166@gmail.com' THEN
    NEW.role = 'admin';
    NEW.status = 'approved';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_primary_admin_user_on_users ON users;
CREATE TRIGGER enforce_primary_admin_user_on_users
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION enforce_primary_admin_user();

-- One-time sync for existing row
UPDATE users
SET role = 'admin', status = 'approved'
WHERE lower(email) = 'apavlovna166@gmail.com';

DROP TRIGGER IF EXISTS update_training_programs_updated_at ON training_programs;
CREATE TRIGGER update_training_programs_updated_at BEFORE UPDATE ON training_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exercises_updated_at ON exercises;
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_program_exercises_updated_at ON program_exercises;
CREATE TRIGGER update_program_exercises_updated_at BEFORE UPDATE ON program_exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_workout_notes_updated_at ON workout_notes;
CREATE TRIGGER update_workout_notes_updated_at BEFORE UPDATE ON workout_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_custom_workouts_updated_at ON custom_workouts;
CREATE TRIGGER update_custom_workouts_updated_at BEFORE UPDATE ON custom_workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_workouts ENABLE ROW LEVEL SECURITY;

-- Helper function for admin checks without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Row Level Security Policies for users table
-- Users can read their own profile
DROP POLICY IF EXISTS users_select_own ON users;
CREATE POLICY users_select_own ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can create their own profile row
DROP POLICY IF EXISTS users_insert_own ON users;
CREATE POLICY users_insert_own ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can read all users
DROP POLICY IF EXISTS users_select_all_admin ON users;
CREATE POLICY users_select_all_admin ON users FOR SELECT
  USING (public.is_admin());

-- Users can update their own profile (only name)
DROP POLICY IF EXISTS users_update_own ON users;
CREATE POLICY users_update_own ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'user'); -- Prevent role escalation

-- Admins can update user status
DROP POLICY IF EXISTS users_update_admin ON users;
CREATE POLICY users_update_admin ON users FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Row Level Security Policies for training_programs
-- Everyone can read programs
DROP POLICY IF EXISTS training_programs_select ON training_programs;
CREATE POLICY training_programs_select ON training_programs FOR SELECT
  USING (true);

-- Only admins can create/update/delete programs
DROP POLICY IF EXISTS training_programs_insert_admin ON training_programs;
CREATE POLICY training_programs_insert_admin ON training_programs FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS training_programs_update_admin ON training_programs;
CREATE POLICY training_programs_update_admin ON training_programs FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS training_programs_delete_admin ON training_programs;
CREATE POLICY training_programs_delete_admin ON training_programs FOR DELETE
  USING (public.is_admin());

-- Row Level Security Policies for exercises
-- Everyone can read exercises
DROP POLICY IF EXISTS exercises_select ON exercises;
CREATE POLICY exercises_select ON exercises FOR SELECT
  USING (true);

-- Only admins can create/update/delete exercises
DROP POLICY IF EXISTS exercises_insert_admin ON exercises;
CREATE POLICY exercises_insert_admin ON exercises FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS exercises_update_admin ON exercises;
CREATE POLICY exercises_update_admin ON exercises FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS exercises_delete_admin ON exercises;
CREATE POLICY exercises_delete_admin ON exercises FOR DELETE
  USING (public.is_admin());

-- Row Level Security Policies for program_exercises
-- Everyone can read program_exercises
DROP POLICY IF EXISTS program_exercises_select ON program_exercises;
CREATE POLICY program_exercises_select ON program_exercises FOR SELECT
  USING (true);

-- Only admins can modify program_exercises
DROP POLICY IF EXISTS program_exercises_insert_admin ON program_exercises;
CREATE POLICY program_exercises_insert_admin ON program_exercises FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS program_exercises_update_admin ON program_exercises;
CREATE POLICY program_exercises_update_admin ON program_exercises FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS program_exercises_delete_admin ON program_exercises;
CREATE POLICY program_exercises_delete_admin ON program_exercises FOR DELETE
  USING (public.is_admin());

-- Row Level Security Policies for user_progress
-- Users can read/create/update their own progress
DROP POLICY IF EXISTS user_progress_select_own ON user_progress;
CREATE POLICY user_progress_select_own ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_progress_insert_own ON user_progress;
CREATE POLICY user_progress_insert_own ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_progress_update_own ON user_progress;
CREATE POLICY user_progress_update_own ON user_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all progress
DROP POLICY IF EXISTS user_progress_select_admin ON user_progress;
CREATE POLICY user_progress_select_admin ON user_progress FOR SELECT
  USING (public.is_admin());

-- Row Level Security Policies for workout_notes
DROP POLICY IF EXISTS workout_notes_select_own ON workout_notes;
CREATE POLICY workout_notes_select_own ON workout_notes FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS workout_notes_insert_own ON workout_notes;
CREATE POLICY workout_notes_insert_own ON workout_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS workout_notes_update_own ON workout_notes;
CREATE POLICY workout_notes_update_own ON workout_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS workout_notes_delete_own ON workout_notes;
CREATE POLICY workout_notes_delete_own ON workout_notes FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS workout_notes_select_admin ON workout_notes;
CREATE POLICY workout_notes_select_admin ON workout_notes FOR SELECT
  USING (public.is_admin());

-- Row Level Security Policies for workout_sessions
DROP POLICY IF EXISTS workout_sessions_select_own ON workout_sessions;
CREATE POLICY workout_sessions_select_own ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS workout_sessions_insert_own ON workout_sessions;
CREATE POLICY workout_sessions_insert_own ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS workout_sessions_update_own ON workout_sessions;
CREATE POLICY workout_sessions_update_own ON workout_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS workout_sessions_delete_own ON workout_sessions;
CREATE POLICY workout_sessions_delete_own ON workout_sessions FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS workout_sessions_select_admin ON workout_sessions;
CREATE POLICY workout_sessions_select_admin ON workout_sessions FOR SELECT
  USING (public.is_admin());

-- Row Level Security Policies for custom_workouts
DROP POLICY IF EXISTS custom_workouts_select_own ON custom_workouts;
CREATE POLICY custom_workouts_select_own ON custom_workouts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS custom_workouts_insert_own ON custom_workouts;
CREATE POLICY custom_workouts_insert_own ON custom_workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS custom_workouts_update_own ON custom_workouts;
CREATE POLICY custom_workouts_update_own ON custom_workouts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS custom_workouts_delete_own ON custom_workouts;
CREATE POLICY custom_workouts_delete_own ON custom_workouts FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS custom_workouts_select_admin ON custom_workouts;
CREATE POLICY custom_workouts_select_admin ON custom_workouts FOR SELECT
  USING (public.is_admin());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-avatars',
  'profile-avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS profile_avatars_read ON storage.objects;
CREATE POLICY profile_avatars_read ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-avatars');

DROP POLICY IF EXISTS profile_avatars_insert_own ON storage.objects;
CREATE POLICY profile_avatars_insert_own ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS profile_avatars_update_own ON storage.objects;
CREATE POLICY profile_avatars_update_own ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS profile_avatars_delete_own ON storage.objects;
CREATE POLICY profile_avatars_delete_own ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Insert seed data (optional - comment out if not needed)
-- Training Programs
INSERT INTO training_programs (name, description, duration, difficulty) VALUES
('Beginner Full Body', 'A complete 30-day program for fitness beginners', 30, 'beginner'),
('Intermediate Strength', 'Build muscle strength in 45 days', 45, 'intermediate'),
('Advanced Cardio', 'High-intensity cardio training program', 60, 'advanced'),
('Core & Flexibility', 'Improve core strength and flexibility', 28, 'beginner')
ON CONFLICT DO NOTHING;

-- Exercises
INSERT INTO exercises (name, description, image_url) VALUES
('Push-ups', 'Classic upper body exercise', 'https://via.placeholder.com/300x200?text=Push-ups'),
('Squats', 'Lower body strength building', 'https://via.placeholder.com/300x200?text=Squats'),
('Lunges', 'Single leg strength exercise', 'https://via.placeholder.com/300x200?text=Lunges'),
('Plank', 'Core stability exercise', 'https://via.placeholder.com/300x200?text=Plank'),
('Running', 'Cardio endurance', 'https://via.placeholder.com/300x200?text=Running'),
('Burpees', 'Full body workout', 'https://via.placeholder.com/300x200?text=Burpees')
ON CONFLICT DO NOTHING;

-- Motivation progress (1..36) per user
CREATE TABLE IF NOT EXISTS user_motivation_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  workouts_completed INTEGER NOT NULL DEFAULT 0 CHECK (workouts_completed >= 0),
  current_day INTEGER NOT NULL DEFAULT 0 CHECK (current_day >= 0 AND current_day <= 36),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_motivation_progress_day ON user_motivation_progress(current_day DESC);

DROP TRIGGER IF EXISTS update_user_motivation_progress_updated_at ON user_motivation_progress;
CREATE TRIGGER update_user_motivation_progress_updated_at
  BEFORE UPDATE ON user_motivation_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_motivation_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_motivation_progress_select_own ON user_motivation_progress;
CREATE POLICY user_motivation_progress_select_own ON user_motivation_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_motivation_progress_insert_own ON user_motivation_progress;
CREATE POLICY user_motivation_progress_insert_own ON user_motivation_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_motivation_progress_update_own ON user_motivation_progress;
CREATE POLICY user_motivation_progress_update_own ON user_motivation_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP FUNCTION IF EXISTS increment_motivation_progress(UUID);
CREATE OR REPLACE FUNCTION increment_motivation_progress(p_user_id UUID)
RETURNS TABLE(workouts_completed INTEGER, current_day INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Not authorized to increment motivation progress for this user';
  END IF;

  RETURN QUERY
  INSERT INTO user_motivation_progress (user_id, workouts_completed, current_day)
  VALUES (p_user_id, 1, 1)
  ON CONFLICT (user_id)
  DO UPDATE SET
    workouts_completed = user_motivation_progress.workouts_completed + 1,
    current_day = LEAST(36, user_motivation_progress.current_day + 1),
    updated_at = NOW()
  RETURNING user_motivation_progress.workouts_completed, user_motivation_progress.current_day;
END;
$$;

REVOKE ALL ON FUNCTION increment_motivation_progress(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_motivation_progress(UUID) TO authenticated;
