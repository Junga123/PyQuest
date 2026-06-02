const express = require('express');
const { z } = require('zod');

function createPublicRouter({ pool, redis, env }) {
  const router = express.Router();

  router.get('/courses', async (_req, res) => {
    const rows = await pool.query(
      `SELECT id, title, description, image_url, difficulty, xp_reward
       FROM courses
       WHERE is_active = true
       ORDER BY updated_at DESC
       LIMIT 50`
    );
    return res.status(200).json({ courses: rows.rows });
  });

  router.get('/lessons', async (req, res) => {
    const qSchema = z.object({
      courseId: z.string().uuid().optional(),
    });
    const query = qSchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({ error: 'Invalid query' });
    }

    const { courseId } = query.data;

    const rows = courseId
      ? await pool.query(
          `SELECT id, course_id, order_index, title, content, image_url
           FROM lessons
           WHERE course_id = $1 AND is_active = true
           ORDER BY order_index ASC`,
          [courseId]
        )
      : await pool.query(
          `SELECT id, course_id, order_index, title, content, image_url
           FROM lessons
           WHERE is_active = true
           ORDER BY updated_at DESC
           LIMIT 50`
        );

    return res.status(200).json({ lessons: rows.rows });
  });

  router.get('/lessons/:lessonId', async (req, res, next) => {
    try {
      const { lessonId } = req.params;
      const rows = await pool.query(
        `SELECT id, course_id, order_index, title, content, image_url, is_active
         FROM lessons
         WHERE id = $1
         LIMIT 1`,
        [lessonId]
      );
      if (rows.rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });
      return res.status(200).json({ lesson: rows.rows[0] });
    } catch (err) {
      return next(err);
    }
  });

  router.get('/tasks', async (req, res) => {
    const qSchema = z.object({
      lessonId: z.string().uuid().optional(),
    });

    const query = qSchema.safeParse(req.query);
    if (!query.success) return res.status(400).json({ error: 'Invalid query' });

    const { lessonId } = query.data;

    if (lessonId) {
      const rows = await pool.query(
        `SELECT id, lesson_id, order_index, task_type, title, prompt, hint, xp_reward, validation, is_active
         FROM tasks
         WHERE lesson_id = $1 AND is_active = true
         ORDER BY order_index ASC`,
        [lessonId]
      );
      return res.status(200).json({ tasks: rows.rows });
    }

    const rows = await pool.query(
      `SELECT id, lesson_id, order_index, task_type, title, prompt, hint, xp_reward, validation, is_active
       FROM tasks
       WHERE is_active = true
       ORDER BY created_at DESC
       LIMIT 50`
    );
    return res.status(200).json({ tasks: rows.rows });
  });

  router.get('/tasks/:taskId', async (req, res, next) => {
    try {
      const { taskId } = req.params;
      const rows = await pool.query(
        `SELECT id, lesson_id, order_index, task_type, title, prompt, hint, xp_reward, validation, is_active, created_at
         FROM tasks
         WHERE id = $1
         LIMIT 1`,
        [taskId]
      );
      if (rows.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
      return res.status(200).json({ task: rows.rows[0] });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}

module.exports = { createPublicRouter };

