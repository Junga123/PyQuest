const { createApp } = require('./app');
const { loadEnv } = require('./config/env');

async function main() {
  const env = loadEnv();
  const app = createApp(env);

  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[PyQuest API] listening on port ${env.PORT}`);
  });

  const shutdown = async () => {
    // eslint-disable-next-line no-console
    console.log('[PyQuest API] shutting down...');
    try {
      server.close();
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[PyQuest API] fatal startup error:', err);
  process.exit(1);
});

