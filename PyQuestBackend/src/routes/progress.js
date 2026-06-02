const express = require('express');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const { authRequired } = require('../middleware/authRequired');
const { executeInSandbox } = require('../clients/sandboxClient');

function createProgressRouter({ pool, redis, env }) {
  const router = express.Router();

  const requireAuth = authRequired({ jwtSecret: env.JWT_SECRET });

  router.post('/lessons/:lessonId/start', requireAuth, async (req, res, next) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user.id;

      const progressInsert = await pool.query(
        `INSERT INTO lesson_progress (user_id, lesson_id, status, started_at, current_task_index, completed_task_ids, xp_earned)
         VALUES ($1, $2, 'in_progress', now(), 0, '{}'::uuid[], 0)
         ON CONFLICT (user_id, lesson_id) DO UPDATE
           SET status = CASE lesson_progress.status
             WHEN 'not_started' THEN 'in_progress'
             ELSE lesson_progress.status
           END,
               started_at = COALESCE(lesson_progress.started_at, now())
         RETURNING id, status, started_at, completed_at, current_task_index, completed_task_ids, xp_earned, updated_at`,
        [userId, lessonId]
      );

      return res.status(200).json({ progress: progressInsert.rows[0] });
    } catch (err) {
      return next(err);
    }
  });

  router.get('/lessons/:lessonId', requireAuth, async (req, res, next) => {
    try {
      const { lessonId } = req.params;
      const userId = req.user.id;

      const found = await pool.query(
        `SELECT id, status, started_at, completed_at, current_task_index, completed_task_ids, xp_earned, updated_at
         FROM lesson_progress
         WHERE user_id = $1 AND lesson_id = $2
         LIMIT 1`,
        [userId, lessonId]
      );

      return res.status(200).json({ progress: found.rows[0] || null });
    } catch (err) {
      return next(err);
    }
  });

  router.post('/tasks/:taskId/attempt', requireAuth, async (req, res, next) => {
    try {
      const { taskId } = req.params;
      const userId = req.user.id;

      // answer может быть:
      // - number (multiple_choice)
      // - string (fill_gap)
      // - { code: string } для code tasks
      const bodySchema = z.object({
        answer: z.any().optional(),
        code: z.string().optional(),
        step_through: z.boolean().optional(),
      });
      const body = bodySchema.parse(req.body);

      const taskRes = await pool.query(
        `SELECT id, lesson_id, order_index, task_type, prompt, hint, xp_reward, validation, is_active
         FROM tasks
         WHERE id = $1 AND is_active = true
         LIMIT 1`,
        [taskId]
      );

      if (taskRes.rows.length === 0) return res.status(404).json({ error: 'Task not found' });

      const task = taskRes.rows[0];

      // Парсим JSON validation (pg возвращает объект при jsonb)
      const validation = task.validation || {};

      let isCorrect = false;
      let xpEarned = 0;
      let output = null;
      let trace = null;

      if (task.task_type === 'multiple_choice') {
        const expectedIndex = validation.correctAnswerIndex;
        const given = body.answer;
        isCorrect = typeof expectedIndex === 'number' && typeof given === 'number' && given === expectedIndex;
        xpEarned = isCorrect ? task.xp_reward : 0;
      } else if (task.task_type === 'fill_gap') {
        const expected = typeof validation.expected === 'string' ? validation.expected : null;
        const given = typeof body.answer === 'string' ? body.answer : null;
        const caseSensitive = validation.caseSensitive === true;
        if (expected !== null && given !== null) {
          if (caseSensitive) isCorrect = given.trim() === expected.trim();
          else isCorrect = given.trim().toLowerCase() === expected.trim().toLowerCase();
        }
        xpEarned = isCorrect ? task.xp_reward : 0;
      } else if (task.task_type === 'write_code' || task.task_type === 'debug_code') {
        const userCode = body.code;
        if (!userCode || userCode.trim().length === 0) {
          return res.status(400).json({ error: 'Code is required' });
        }

        const testsCode = typeof validation.tests_code === 'string' ? validation.tests_code : '';
        const sandboxRes = await executeInSandbox({
          sandboxBaseUrl: env.SANDBOX_BASE_URL,
          code: userCode,
          testsCode,
          stepThrough: !!body.step_through,
          timeoutMs: typeof validation.timeout_ms === 'number' ? validation.timeout_ms : 1200,
        });

        output = { stdout: sandboxRes.stdout, stderr: sandboxRes.stderr, success: sandboxRes.success };
        trace = sandboxRes.trace || null;

        // MVP: считаем правильным, если sandbox success=true и stderr пустой
        isCorrect = sandboxRes.success === true;
        xpEarned = isCorrect ? task.xp_reward : 0;
      } else {
        return res.status(400).json({ error: `Unsupported task type: ${task.task_type}` });
      }

      // Сохраняем попытку
      await pool.query(
        `INSERT INTO task_attempts (user_id, task_id, lesson_id, is_correct, xp_earned, input, output, trace, client_ts)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, now())`,
        [
          userId,
          taskId,
          task.lesson_id,
          isCorrect,
          xpEarned,
          JSON.stringify({ answer: body.answer, step_through: body.step_through, code: body.code }),
          JSON.stringify(output),
          JSON.stringify(trace),
        ]
      );

      // Обновляем прогресс по уроку
      const progressFound = await pool.query(
        `SELECT id, status, current_task_index, completed_task_ids, xp_earned
         FROM lesson_progress
         WHERE user_id = $1 AND lesson_id = $2
         LIMIT 1`,
        [userId, task.lesson_id]
      );

      if (progressFound.rows.length === 0) {
        // Автоматически стартуем прогресс, если его не было
        await pool.query(
          `INSERT INTO lesson_progress (user_id, lesson_id, status, started_at, current_task_index, completed_task_ids, xp_earned)
           VALUES ($1, $2, 'in_progress', now(), 0, '{}'::uuid[], 0)`,
          [userId, task.lesson_id]
        );
      }

      const progressNow = await pool.query(
        `SELECT status, current_task_index, completed_task_ids, xp_earned
         FROM lesson_progress WHERE user_id=$1 AND lesson_id=$2`,
        [userId, task.lesson_id]
      );
      const progress = progressNow.rows[0];

      if (isCorrect) {
        const completed = Array.isArray(progress.completed_task_ids) ? progress.completed_task_ids : [];
        const nextCompleted = completed.includes(taskId) ? completed : [...completed, taskId];

        const currentTaskIndex = Number(progress.current_task_index) || 0;
        const nextTaskIndex =
          task.order_index === currentTaskIndex ? currentTaskIndex + 1 : currentTaskIndex;

        const totalTasksRes = await pool.query(
          `SELECT COUNT(*)::int AS total
           FROM tasks
           WHERE lesson_id = $1 AND is_active = true`,
          [task.lesson_id]
        );
        const totalTasks = totalTasksRes.rows[0]?.total ?? currentTaskIndex + 1;
        const shouldComplete = nextTaskIndex >= totalTasks;

        await pool.query(
          `UPDATE lesson_progress
           SET status = $1::progress_status,
               current_task_index = $2,
               completed_task_ids = $3::uuid[],
               xp_earned = xp_earned + $4,
               completed_at = CASE WHEN $1::progress_status = 'completed' THEN now() ELSE completed_at END,
               updated_at = now()
           WHERE user_id = $5 AND lesson_id = $6`,
          [shouldComplete ? 'completed' : 'in_progress', nextTaskIndex, nextCompleted, xpEarned, userId, task.lesson_id]
        );

        // Начисляем XP на профиль пользователя
        await pool.query(
          `UPDATE users
           SET total_xp = total_xp + $1,
               updated_at = now()
           WHERE id = $2`,
          [xpEarned, userId]
        );
      }

      return res.status(200).json({
        ok: isCorrect,
        xpEarned,
        output,
        trace,
      });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}

module.exports = { createProgressRouter };

