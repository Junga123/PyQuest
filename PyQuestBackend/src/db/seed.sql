-- PyQuest seed (MVP example)
-- Assumes schema.sql is applied first.
--
-- This seed uses deterministic UUIDs so subsequent runs won't create duplicates.

DO $$
DECLARE
  course_id uuid := '11111111-1111-1111-1111-111111111111';
  lesson_id uuid := '22222222-2222-2222-2222-222222222222';
  task_mc uuid := '33333333-3333-3333-3333-333333333333';
  task_fg uuid := '44444444-4444-4444-4444-444444444444';
  task_code uuid := '55555555-5555-5555-5555-555555555555';
BEGIN
  INSERT INTO courses (id, title, description, image_url, difficulty, is_active, xp_reward)
  VALUES (
    course_id,
    'Основы Python',
    'Учитесь писать код и проверять решения',
    NULL,
    'easy',
    true,
    0
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO lessons (id, course_id, order_index, title, content, image_url, is_active)
  VALUES (
    lesson_id,
    course_id,
    0,
    'Урок 1: Делаем первые упражнения',
    '{
      "description": "Короткий старт: ответы на вопросы и простые функции.",
      "shortDescription": "Первые шаги",
      "difficulty": "easy",
      "estimatedTime": 10,
      "distance": 0,
      "xpReward": 120,
      "category": "history",
      "tags": ["python","basics"],
      "isPremium": false,
      "minLevel": 1,
      "startPoint": { "latitude": 0, "longitude": 0 },
      "region": "MVP"
    }'::jsonb,
    NULL,
    true
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO tasks (id, lesson_id, order_index, task_type, title, prompt, hint, xp_reward, validation, is_active)
  VALUES
  (
    task_mc,
    lesson_id,
    0,
    'multiple_choice',
    'Вопрос',
    'Сколько будет 2 + 2?',
    'Подсказка: сложение',
    50,
    '{
      "question": "Сколько будет 2 + 2?",
      "options": ["3", "4", "5"],
      "correctAnswerIndex": 1
    }'::jsonb,
    true
  ),
  (
    task_fg,
    lesson_id,
    1,
    'fill_gap',
    'Fill the gap',
    'Введите строку: print("Привет")',
    'Требуется точное совпадение',
    50,
    '{
      "expected": "print(\"Привет\")",
      "caseSensitive": true
    }'::jsonb,
    true
  ),
  (
    task_code,
    lesson_id,
    2,
    'write_code',
    'Пишем функцию',
    'Реализуйте функцию add(a, b), которая возвращает сумму.',
    'Пример: def add(a, b): return a + b',
    120,
    '{
      "tests_code": "assert add(2, 3) == 5\\nassert add(-1, 1) == 0"
    }'::jsonb,
    true
  )
  ON CONFLICT (id) DO NOTHING;
END$$;

