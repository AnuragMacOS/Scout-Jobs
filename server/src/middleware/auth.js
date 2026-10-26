const { verifyToken, COOKIE_NAME } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  try {
    const token = req.cookies[COOKIE_NAME];
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
