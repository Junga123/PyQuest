-- PyQuest schema (MVP skeleton)
-- Run: psql "$DATABASE_URL" -f schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_type') THEN
    CREATE TYPE task_type AS ENUM ('multiple_choice', 'fill_gap', 'write_code', 'debug_code');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'progress_status') THEN
    CREATE TYPE progress_status AS ENUM ('not_started', 'in_progress', 'completed');
  END IF;
END$$;

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  password_hash text NOT NULL,
  display_name text NOT NULL,

  total_xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  is_blocked boolean NOT NULL DEFAULT false,

  settings jsonb NOT NULL DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower
  ON users (lower(email));

-- ============================================
-- COURSES / LESSONS
-- ============================================
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  difficulty text NOT NULL DEFAULT 'easy',
  is_active boolean NOT NULL DEFAULT true,

  xp_reward integer NOT NULL DEFAULT 0,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  order_index integer NOT NULL,

  title text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lessons_course_order ON lessons(course_id, order_index);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  order_index integer NOT NULL,

  task_type task_type NOT NULL,
  title text NOT NULL DEFAULT '',
  prompt text NOT NULL DEFAULT '',
  hint text,
  xp_reward integer NOT NULL DEFAULT 0,

  -- Validation rules & expected answers (per task type)
  validation jsonb NOT NULL DEFAULT '{}'::jsonb,

  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_lesson_order ON tasks(lesson_id, order_index);

-- ============================================
-- USER PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,

  status progress_status NOT NULL DEFAULT 'not_started',
  started_at timestamptz,
  completed_at timestamptz,

  current_task_index integer NOT NULL DEFAULT 0,
  completed_task_ids uuid[] NOT NULL DEFAULT '{}',
  xp_earned integer NOT NULL DEFAULT 0,

  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);

-- ============================================
-- TASK ATTEMPTS
-- ============================================
CREATE TABLE IF NOT EXISTS task_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,

  created_at timestamptz NOT NULL DEFAULT now(),
  is_correct boolean NOT NULL DEFAULT false,
  xp_earned integer NOT NULL DEFAULT 0,

  input jsonb,
  output jsonb,
  trace jsonb,

  -- anti-spam / rate-limiting metadata
  client_ts timestamptz
);

CREATE INDEX IF NOT EXISTS idx_task_attempts_user_created ON task_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_attempts_task_created ON task_attempts(task_id, created_at DESC);

-- ============================================
-- ACHIEVEMENTS (MVP skeleton)
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon_url text,
  xp_reward integer NOT NULL DEFAULT 0,
  rarity text NOT NULL DEFAULT 'common',
  condition jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

