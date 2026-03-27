const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;

function makeToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ── Google ────────────────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false, state: false }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND}/?auth=fail`, session: false, state: false }),
  (req, res) => {
    const token = makeToken(req.user);
    res.redirect(`${FRONTEND}/?token=${token}`);
  }
);

// ── GitHub ────────────────────────────────────────────────────────────────────
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${FRONTEND}/?auth=fail`, session: false }),
  (req, res) => {
    const token = makeToken(req.user);
    res.redirect(`${FRONTEND}/?token=${token}`);
  }
);

// ── Microsoft ─────────────────────────────────────────────────────────────────
router.get('/microsoft', passport.authenticate('microsoft', { scope: ['user.read'], session: false }));
router.get('/microsoft/callback',
  passport.authenticate('microsoft', { failureRedirect: `${FRONTEND}/?auth=fail`, session: false }),
  (req, res) => {
    const token = makeToken(req.user);
    res.redirect(`${FRONTEND}/?token=${token}`);
  }
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
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());
    const user = await User.create({
      provider: 'email', name, email, passwordHash: hash,
      role: adminEmails.includes(email) ? 'admin' : 'user'
    });
    const token = makeToken(user);
    res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
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
    const token = makeToken(user);
    res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Current user ──────────────────────────────────────────────────────────────
router.get('/me', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.json({ user: null });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ user: { _id: payload.id, email: payload.email, role: payload.role } });
  } catch {
    res.json({ user: null });
  }
});

// ── Logout ────────────────────────────────────────────────────────────────────
// JWT is stateless — logout is handled client-side by deleting the token.
// This endpoint exists so the frontend redirect still works.
router.get('/logout', (req, res) => {
  res.redirect(FRONTEND);
});

// ── Profile update ────────────────────────────────────────────────────────────
const { ensureAuth } = require('../middleware/auth');

router.patch('/profile', ensureAuth, async (req, res) => {
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
    const token = makeToken(user);
    res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
