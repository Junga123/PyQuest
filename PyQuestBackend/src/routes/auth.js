const express = require('express');
const { z } = require('zod');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { authRequired } = require('../middleware/authRequired');

function createAuthRouter({ pool, redis, env }) {
  const router = express.Router();

  const requireAuth = authRequired({ jwtSecret: env.JWT_SECRET });

  router.post('/register', async (req, res, next) => {
    try {
      const bodySchema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        displayName: z.string().min(1).max(80),
      });
      const body = bodySchema.parse(req.body);

      const normalizedEmail = body.email.trim().toLowerCase();

      const exists = await pool.query('SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1', [
        normalizedEmail,
      ]);
      if (exists.rows.length > 0) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(body.password, 12);

      const userInsert = await pool.query(
        `INSERT INTO users (email, password_hash, display_name, settings)
         VALUES ($1, $2, $3, $4::jsonb)
         RETURNING id, email, display_name, total_xp, level, is_blocked, created_at, updated_at`,
        [normalizedEmail, passwordHash, body.displayName.trim(), JSON.stringify({ language: 'ru', theme: 'system' })]
      );

      const user = userInsert.rows[0];
      const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          totalXp: user.total_xp,
          level: user.level,
        },
      });
    } catch (err) {
      return next(err);
    }
  });

  router.post('/login', async (req, res, next) => {
    try {
      const bodySchema = z.object({
        email: z.string().email(),
        password: z.string().min(1),
      });
      const body = bodySchema.parse(req.body);

      const normalizedEmail = body.email.trim().toLowerCase();

      const found = await pool.query(
        `SELECT id, email, password_hash, display_name, total_xp, level, is_blocked
         FROM users WHERE lower(email) = lower($1) LIMIT 1`,
        [normalizedEmail]
      );

      if (found.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = found.rows[0];
      if (user.is_blocked) {
        return res.status(403).json({ error: 'Account blocked' });
      }

      const ok = await bcrypt.compare(body.password, user.password_hash);
      if (!ok) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: '7d' });

      return res.status(200).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          totalXp: user.total_xp,
          level: user.level,
        },
      });
    } catch (err) {
      return next(err);
    }
  });

  router.get('/me', requireAuth, async (req, res, next) => {
    try {
      const userId = req.user.id;
      const found = await pool.query(
        `SELECT id, email, display_name, total_xp, level, is_blocked, settings, created_at, updated_at
         FROM users WHERE id = $1 LIMIT 1`,
        [userId]
      );

      if (found.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      const user = found.rows[0];

      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          displayName: user.display_name,
          totalXp: user.total_xp,
          level: user.level,
          settings: user.settings,
        },
      });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}

module.exports = { createAuthRouter };

