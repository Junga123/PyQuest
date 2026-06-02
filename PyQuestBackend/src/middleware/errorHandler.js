function errorHandler(err, _req, res, _next) {
  // eslint-disable-next-line no-console
  console.error('[PyQuest API] error:', err);

  const status = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = err.publicMessage || err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    // dev only
    debug: process.env.NODE_ENV === 'development' ? String(err) : undefined,
  });
}

module.exports = { errorHandler };

