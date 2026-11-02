const { verifyToken, COOKIE_NAME } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  try {
    let token = req.cookies?.[COOKIE_NAME];

    // Support Authorization: Bearer <token> for cross-origin deployments (e.g. Vercel frontend <-> Render backend)
    // where browsers enforce strict third-party cookie blocking
    if (!token && req.headers?.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      req.user = null;
      return next();
    }

    // Attach verified user identity from signed JWT without an extra remote database roundtrip
    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    req.user = null;
    next();
  }
}

module.exports = authMiddleware;
