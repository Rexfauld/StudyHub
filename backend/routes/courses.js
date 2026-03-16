const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ensureAuth } = require('../middleware/auth');

// Course schema (inline — add to models/ if preferred)
const courseSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  programSlug: { type: String, required: true },
  addedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt:   { type: Date, default: Date.now }
});
courseSchema.index({ programSlug: 1 });
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

// GET /api/courses?programSlug=...  — public
router.get('/', async (req, res) => {
  const { programSlug } = req.query;
  if (!programSlug) return res.status(400).json({ error: 'programSlug required' });
  try {
    const courses = await Course.find({ programSlug }).sort({ createdAt: 1 });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/courses — requires auth
router.post('/', ensureAuth, async (req, res) => {
  const { name, programSlug } = req.body;
  if (!name || !programSlug) return res.status(400).json({ error: 'name and programSlug required' });
  try {
    const course = await Course.create({ name, programSlug, addedBy: req.user._id });
    res.status(201).json({ course });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/courses/:id — requires auth (own course or admin)
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Not found' });
    const isOwner = course.addedBy?.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    await course.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
