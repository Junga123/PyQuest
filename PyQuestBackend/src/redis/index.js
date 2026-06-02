const Redis = require('ioredis');

function createRedisClient(redisUrl) {
  if (!redisUrl) return null;
  const client = new Redis(redisUrl);
  return client;
}

module.exports = { createRedisClient };

