-- Critical migration: per-user workout data persistence
-- Safe to run multiple times (idempotent)

BEGIN;

-- 1) Ensure required tables exist
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

CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('builder', 'fat-loss', 'tone')),
  source_key TEXT NOT NULL,
  title TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'skipped')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2) Ensure newer columns exist for calendar summary popup
ALTER TABLE workout_sessions
  ADD COLUMN IF NOT EXISTS session_type TEXT NOT NULL DEFAULT 'circuit' CHECK (session_type IN ('circuit', 'sets'));

ALTER TABLE workout_sessions
  ADD COLUMN IF NOT EXISTS session_summary TEXT;

-- 3) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_workout_notes_user_id ON workout_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_notes_updated_at ON workout_notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_completed_at ON workout_sessions(completed_at DESC);

-- 4) Enable RLS (owner-only data isolation)
ALTER TABLE workout_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;

-- 5) workout_notes policies
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

-- 6) workout_sessions policies
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

COMMIT;

-- Verification queries (run after migration)
-- 1) Confirm columns
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'workout_sessions' AND column_name IN ('session_type', 'session_summary');

-- 2) Confirm RLS is enabled
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public' AND tablename IN ('workout_notes', 'workout_sessions');

-- 3) Confirm policies
-- SELECT tablename, policyname, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename IN ('workout_notes', 'workout_sessions')
-- ORDER BY tablename, policyname;
