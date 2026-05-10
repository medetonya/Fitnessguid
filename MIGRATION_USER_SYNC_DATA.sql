-- Migration: cross-device user data sync hardening
-- Adds backend fields for avatar/language and persistent custom workouts storage.
-- Safe to run multiple times (idempotent)

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS preferred_language TEXT CHECK (preferred_language IN ('en', 'ru'));

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

CREATE INDEX IF NOT EXISTS idx_custom_workouts_user_id ON custom_workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_workouts_created_at ON custom_workouts(created_at DESC);

DROP TRIGGER IF EXISTS update_custom_workouts_updated_at ON custom_workouts;
CREATE TRIGGER update_custom_workouts_updated_at
  BEFORE UPDATE ON custom_workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE custom_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_workouts FORCE ROW LEVEL SECURITY;

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
ALTER TABLE user_motivation_progress FORCE ROW LEVEL SECURITY;

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

DROP TRIGGER IF EXISTS ensure_user_motivation_progress_on_users ON users;
DROP FUNCTION IF EXISTS ensure_user_motivation_progress_row();
CREATE OR REPLACE FUNCTION ensure_user_motivation_progress_row()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_motivation_progress (user_id, workouts_completed, current_day)
  VALUES (NEW.id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER ensure_user_motivation_progress_on_users
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION ensure_user_motivation_progress_row();

INSERT INTO user_motivation_progress (user_id, workouts_completed, current_day)
SELECT id, 0, 0
FROM users
ON CONFLICT (user_id) DO NOTHING;

DROP FUNCTION IF EXISTS increment_motivation_progress();
DROP FUNCTION IF EXISTS increment_motivation_progress(UUID);

CREATE OR REPLACE FUNCTION increment_motivation_progress()
RETURNS TABLE(workouts_completed INTEGER, current_day INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_session_count INTEGER;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authorized to increment motivation progress for this user';
  END IF;

  SELECT COUNT(*)::INTEGER
  INTO v_session_count
  FROM workout_sessions
  WHERE user_id = v_user_id
    AND status = 'completed';

  RETURN QUERY
  INSERT INTO user_motivation_progress (user_id, workouts_completed, current_day)
  VALUES (
    v_user_id,
    GREATEST(1, COALESCE(v_session_count, 0)),
    LEAST(36, GREATEST(1, COALESCE(v_session_count, 0)))
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    workouts_completed = GREATEST(
      user_motivation_progress.workouts_completed + 1,
      COALESCE(v_session_count, 0)
    ),
    current_day = LEAST(
      36,
      GREATEST(
        user_motivation_progress.current_day + 1,
        COALESCE(v_session_count, 0)
      )
    ),
    updated_at = NOW()
  RETURNING user_motivation_progress.workouts_completed, user_motivation_progress.current_day;
END;
$$;

CREATE OR REPLACE FUNCTION increment_motivation_progress(p_user_id UUID)
RETURNS TABLE(workouts_completed INTEGER, current_day INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to increment motivation progress for this user';
  END IF;

  RETURN QUERY SELECT * FROM increment_motivation_progress();
END;
$$;

REVOKE ALL ON FUNCTION increment_motivation_progress() FROM PUBLIC;
REVOKE ALL ON FUNCTION increment_motivation_progress(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_motivation_progress() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_motivation_progress(UUID) TO authenticated;

WITH session_counts AS (
  SELECT
    user_id,
    COUNT(*)::INTEGER AS completed_count
  FROM workout_sessions
  WHERE status = 'completed'
  GROUP BY user_id
)
INSERT INTO user_motivation_progress (user_id, workouts_completed, current_day)
SELECT
  u.id,
  COALESCE(sc.completed_count, 0) AS workouts_completed,
  LEAST(36, COALESCE(sc.completed_count, 0)) AS current_day
FROM users u
LEFT JOIN session_counts sc ON sc.user_id = u.id
ON CONFLICT (user_id)
DO UPDATE SET
  workouts_completed = GREATEST(user_motivation_progress.workouts_completed, EXCLUDED.workouts_completed),
  current_day = LEAST(36, GREATEST(user_motivation_progress.current_day, EXCLUDED.current_day)),
  updated_at = NOW();

ALTER TABLE workout_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_notes FORCE ROW LEVEL SECURITY;

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

CREATE INDEX IF NOT EXISTS idx_workout_notes_user_updated ON workout_notes(user_id, updated_at DESC);

COMMIT;

-- Verification checks:
-- SELECT tablename, rowsecurity, forcerowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN ('custom_workouts', 'workout_notes', 'user_motivation_progress');
--
-- SELECT * FROM increment_motivation_progress();
--
-- SELECT workouts_completed, current_day
-- FROM user_motivation_progress
-- WHERE user_id = auth.uid();
