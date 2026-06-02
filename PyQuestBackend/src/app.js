const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createPool } = require('./db');
const { createRedisClient } = require('./redis');

const { createAuthRouter } = require('./routes/auth');
const { createPublicRouter } = require('./routes/public');
const { createProgressRouter } = require('./routes/progress');
const { createLeaderboardRouter } = require('./routes/leaderboard');
const { errorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFoundHandler');

function createApp(env) {
  const app = express();

  const pool = createPool(env.DATABASE_URL);
  const redis = createRedisClient(env.REDIS_URL);

  app.disable('x-powered-by');

  app.use(helmet());
  app.use(
    cors({
      origin: true,
      credentials: false,
    })
  );

  app.use(express.json({ limit: '1mb' }));

  app.get('/healthz', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.use('/api/auth', createAuthRouter({ pool, redis, env }));
  app.use('/api/public', createPublicRouter({ pool, redis, env }));
  app.use('/api/progress', createProgressRouter({ pool, redis, env }));
  app.use('/api/leaderboard', createLeaderboardRouter({ pool, redis, env }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };

