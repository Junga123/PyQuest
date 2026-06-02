const jwt = require('jsonwebtoken');

function getBearerToken(req) {
  const header = req.headers['authorization'];
  if (!header) return null;
  const parts = String(header).split(' ');
  if (parts.length !== 2) return null;
  return parts[0].toLowerCase() === 'bearer' ? parts[1] : null;
}

function authRequired({ jwtSecret }) {
  return (req, res, next) => {
    try {
      const token = getBearerToken(req);
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const payload = jwt.verify(token, jwtSecret);
      // payload: { sub: userId }
      req.user = { id: payload.sub };
      return next();
    } catch (_err) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}

module.exports = { authRequired };

