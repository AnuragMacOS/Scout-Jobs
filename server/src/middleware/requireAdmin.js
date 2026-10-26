function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'You must be signed in to perform this action' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin employer privileges required' });
  }
  next();
}

module.exports = requireAdmin;
