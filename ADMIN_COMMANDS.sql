-- Fitness Guide - Admin Helper Commands
-- Use these queries in Supabase SQL Editor to manage your system

-- ============================================
-- USER MANAGEMENT
-- ============================================

-- View all users with their roles and status
SELECT id, email, name, role, status, created_at 
FROM users 
ORDER BY created_at DESC;

-- View pending users waiting for approval
SELECT id, email, name, created_at 
FROM users 
WHERE status = 'pending' 
ORDER BY created_at DESC;

-- View approved users
SELECT id, email, name, role, created_at 
FROM users 
WHERE status = 'approved' 
ORDER BY created_at DESC;

-- Approve a specific user
UPDATE users 
SET status = 'approved' 
WHERE email = 'user@example.com';

-- Reject a user
UPDATE users 
SET status = 'rejected' 
WHERE email = 'user@example.com';

-- Make a user an admin
UPDATE users 
SET role = 'admin', status = 'approved' 
WHERE email = 'user@example.com';

-- Remove admin privileges (make user regular)
UPDATE users 
SET role = 'user' 
WHERE email = 'user@example.com';

-- Get user count by status
SELECT status, COUNT(*) as count 
FROM users 
GROUP BY status;

-- Get user count by role
SELECT role, COUNT(*) as count 
FROM users 
GROUP BY role;

-- ============================================
-- TRAINING PROGRAMS
-- ============================================

-- View all training programs
SELECT id, name, difficulty, duration, created_at 
FROM training_programs 
ORDER BY created_at DESC;

-- View programs by difficulty
SELECT id, name, difficulty, duration 
FROM training_programs 
WHERE difficulty = 'beginner' 
ORDER BY created_at DESC;

-- Add a new training program
INSERT INTO training_programs (name, description, duration, difficulty, image_url) 
VALUES (
  'My New Program',
  'Program description here',
  30,
  'beginner',
  'https://via.placeholder.com/300x200?text=My+Program'
);

-- Update a program
UPDATE training_programs 
SET name = 'Updated Name', description = 'New description'
WHERE name = 'My New Program';

-- Delete a program
DELETE FROM training_programs 
WHERE name = 'My New Program';

-- ============================================
-- EXERCISES
-- ============================================

-- View all exercises
SELECT id, name, description 
FROM exercises 
ORDER BY created_at DESC;

-- Add a new exercise
INSERT INTO exercises (name, description, image_url) 
VALUES (
  'Exercise Name',
  'Exercise description with instructions',
  'https://via.placeholder.com/300x200?text=Exercise'
);

-- Update exercise
UPDATE exercises 
SET description = 'Updated description'
WHERE name = 'Exercise Name';

-- Delete exercise
DELETE FROM exercises 
WHERE name = 'Exercise Name';

-- ============================================
-- PROGRAM EXERCISES (Linking exercises to programs)
-- ============================================

-- View all program-exercise combinations
SELECT 
  tp.name as program_name,
  e.name as exercise_name,
  pe."order",
  pe.sets,
  pe.reps
FROM program_exercises pe
JOIN training_programs tp ON pe.program_id = tp.id
JOIN exercises e ON pe.exercise_id = e.id
ORDER BY tp.name, pe."order";

-- View exercises for a specific program
SELECT 
  e.name,
  pe."order",
  pe.sets,
  pe.reps
FROM program_exercises pe
JOIN exercises e ON pe.exercise_id = e.id
JOIN training_programs tp ON pe.program_id = tp.id
WHERE tp.name = 'Beginner Full Body'
ORDER BY pe."order";

-- Add exercise to a program
-- First get the IDs:
SELECT id FROM training_programs WHERE name = 'Beginner Full Body';
SELECT id FROM exercises WHERE name = 'Push-ups';

-- Then add the relationship:
INSERT INTO program_exercises (program_id, exercise_id, "order", sets, reps) 
VALUES (
  'program-id-here',
  'exercise-id-here',
  1,  -- order in program
  3,  -- sets
  10  -- reps
);

-- Update exercise in program
UPDATE program_exercises 
SET sets = 4, reps = 12
WHERE program_id = 'program-id' AND exercise_id = 'exercise-id';

-- ============================================
-- USER PROGRESS TRACKING
-- ============================================

-- View user's current program progress
SELECT 
  u.email,
  tp.name as program_name,
  up.current_day,
  up.status,
  up.started_at,
  up.completed_at
FROM user_progress up
JOIN auth.users u ON up.user_id = u.id
JOIN training_programs tp ON up.program_id = tp.id
WHERE u.email = 'user@example.com';

-- View all active programs
SELECT 
  u.email,
  tp.name as program_name,
  up.current_day,
  tp.duration,
  up.started_at
FROM user_progress up
JOIN auth.users u ON up.user_id = u.id
JOIN training_programs tp ON up.program_id = tp.id
WHERE up.status = 'active'
ORDER BY u.email;

-- View completion statistics
SELECT 
  COUNT(*) as total_programs,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as paused
FROM user_progress;

-- ============================================
-- REPORTING & ANALYTICS
-- ============================================

-- Popular programs (most chosen)
SELECT 
  tp.name,
  tp.difficulty,
  COUNT(up.id) as times_chosen
FROM training_programs tp
LEFT JOIN user_progress up ON tp.id = up.program_id
GROUP BY tp.id, tp.name, tp.difficulty
ORDER BY times_chosen DESC;

-- User activity (when people joined)
SELECT 
  DATE(created_at) as join_date,
  COUNT(*) as new_users
FROM users
GROUP BY DATE(created_at)
ORDER BY join_date DESC;

-- Program completion rate
SELECT 
  tp.name,
  COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN up.status = 'active' THEN 1 END) as active,
  COUNT(up.id) as total
FROM training_programs tp
LEFT JOIN user_progress up ON tp.id = up.program_id
GROUP BY tp.id, tp.name;

-- ============================================
-- MAINTENANCE & CLEANUP
-- ============================================

-- Count total users
SELECT COUNT(*) as total_users FROM users;

-- Count users by status breakdown
SELECT 
  'Total Users' as metric, COUNT(*) as count FROM users
UNION ALL
SELECT 'Approved Users', COUNT(*) FROM users WHERE status = 'approved'
UNION ALL
SELECT 'Pending Users', COUNT(*) FROM users WHERE status = 'pending'
UNION ALL
SELECT 'Rejected Users', COUNT(*) FROM users WHERE status = 'rejected';

-- Find inactive users (no program started in last 30 days)
SELECT 
  u.email,
  u.created_at,
  MAX(up.started_at) as last_program_start
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
WHERE u.status = 'approved'
GROUP BY u.id, u.email, u.created_at
HAVING MAX(up.started_at) < NOW() - INTERVAL '30 days' OR MAX(up.started_at) IS NULL
ORDER BY u.created_at DESC;

-- Delete user completely (use with caution!)
-- DELETE FROM auth.users WHERE email = 'user@example.com';
-- Note: This will cascade delete user data due to ON DELETE CASCADE

-- ============================================
-- TESTING DATA RESET
-- ============================================

-- Delete all data except admin users
-- WARNING: This will delete all user progress, programs, etc.
-- Only use for testing!
/*
DELETE FROM user_progress;
DELETE FROM program_exercises;
DELETE FROM exercises;
DELETE FROM training_programs;
DELETE FROM users WHERE role != 'admin';
*/

-- Quick test data population
-- Insert sample programs
INSERT INTO training_programs (name, description, duration, difficulty) VALUES
('Quick Beginner', '7-day beginner workout', 7, 'beginner'),
('Quick Intermediate', '14-day intermediate workout', 14, 'intermediate')
ON CONFLICT DO NOTHING;

-- Insert sample exercises
INSERT INTO exercises (name, description) VALUES
('Test Exercise 1', 'For testing'),
('Test Exercise 2', 'For testing')
ON CONFLICT DO NOTHING;

-- ============================================
-- PHASE A LAUNCH QA (ROLE/STATUS QUICK FLOW)
-- ============================================

-- 1) Check test user state
SELECT id, email, role, status, created_at
FROM users
WHERE email = 'test@example.com';

-- 2) Force pending state (should show "Awaiting Approval" in app)
UPDATE users
SET role = 'user', status = 'pending'
WHERE email = 'test@example.com';

-- 3) Approve user (should unlock protected routes)
UPDATE users
SET status = 'approved'
WHERE email = 'test@example.com';

-- 4) Promote to admin (should unlock /admin)
UPDATE users
SET role = 'admin', status = 'approved'
WHERE email = 'test@example.com';

-- 5) Revert admin after test
UPDATE users
SET role = 'user'
WHERE email = 'test@example.com';
