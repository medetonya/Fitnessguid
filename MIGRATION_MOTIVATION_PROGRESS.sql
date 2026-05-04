-- Migration: motivation progress day system (1..36) per user
-- Each completed workout increments workouts_completed and current_day.
-- Safe to run multiple times.

BEGIN;

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

COMMIT;

-- Verify:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_motivation_progress';
-- SELECT policyname, cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_motivation_progress';
-- SELECT proname FROM pg_proc WHERE proname = 'increment_motivation_progress';
