const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Google ────────────────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND}/?auth=fail` }),
  (req, res) => res.redirect(`${FRONTEND}/?auth=success`)
);

// ── GitHub ────────────────────────────────────────────────────────────────────
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${FRONTEND}/?auth=fail` }),
  (req, res) => res.redirect(`${FRONTEND}/?auth=success`)
);

// ── Microsoft ─────────────────────────────────────────────────────────────────
router.get('/microsoft', passport.authenticate('microsoft', { scope: ['user.read'] }));
router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: `${FRONTEND}/?auth=fail` }),
  (req, res) => res.redirect(`${FRONTEND}/?auth=success`)
);

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ provider: 'email', name, email, passwordHash: hash });
    req.login(user, err => {
      if (err) return res.status(500).json({ error: 'Login after register failed' });
      res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Email sign in ─────────────────────────────────────────────────────────────
router.post('/email', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  try {
    const user = await User.findOne({ email, provider: 'email' });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid email or password' });
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });
    req.login(user, err => {
      if (err) return res.status(500).json({ error: 'Login failed' });
      res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Current user ──────────────────────────────────────────────────────────────
router.get('/me', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    const { _id, name, email, role, provider } = req.user;
    return res.json({ user: { _id, name, email, role, provider } });
  }
  res.json({ user: null });
});

// ── Logout ────────────────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  req.logout(() => {
    req.session = null;
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
  });
});

// ── Profile update ────────────────────────────────────────────────────────────
router.patch('/profile', async (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated())
    return res.status(401).json({ error: 'Not authenticated' });
  const { name, password } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (name) user.name = name.trim();
    if (password) {
      if (user.provider !== 'email')
        return res.status(400).json({ error: 'Password change only available for email accounts' });
      user.passwordHash = await bcrypt.hash(password, 12);
    }
    await user.save();
    res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
