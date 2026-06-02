function mustEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function loadEnv() {
  // eslint-disable-next-line import/no-extraneous-dependencies
  require('dotenv').config();

  const PORT = toInt(process.env.PORT, 8080);
  const DATABASE_URL = mustEnv('DATABASE_URL');
  const REDIS_URL = process.env.REDIS_URL || '';
  const JWT_SECRET = mustEnv('JWT_SECRET');
  const SANDBOX_BASE_URL = mustEnv('SANDBOX_BASE_URL');

  return {
    PORT,
    DATABASE_URL,
    REDIS_URL,
    JWT_SECRET,
    SANDBOX_BASE_URL,
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
}

module.exports = { loadEnv };

