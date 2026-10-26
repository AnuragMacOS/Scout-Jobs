function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'You must be signed in to perform this action' });
  }
  next();
}

module.exports = requireAuth;
