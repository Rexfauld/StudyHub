exports.ensureAuth = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  // allow anonymous upload? you said anyone can choose to sign up or not — we'll allow anonymous
  // but uploads require attribution. For now: require auth for uploads; you can relax this later.
  res.status(401).json({ error: 'Not authenticated' });
};