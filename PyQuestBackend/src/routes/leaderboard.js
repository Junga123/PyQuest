const express = require('express');

function createLeaderboardRouter({ pool, redis, env }) {
  const router = express.Router();

  router.get('/', async (_req, res) => {
    return res.status(501).json({ error: 'Not implemented: leaderboard' });
  });

  return router;
}

module.exports = { createLeaderboardRouter };

