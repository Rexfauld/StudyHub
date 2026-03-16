const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Upload = require('../models/Upload');
const { ensureAuth } = require('../middleware/auth');
const { sendRejectionEmail } = require('../config/mailer');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

router.post('/approve/:id', ensureAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send('Forbidden');
  const u = await Upload.findById(req.params.id);
  u.status = 'approved';
  u.approvedAt = new Date();
  await u.save();
  res.json({ success: true, upload: u });
});

router.post('/reject/:id', ensureAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send('Forbidden');
  const u = await Upload.findById(req.params.id).populate('uploader', 'name email');
  u.status = 'rejected';
  u.adminNote = req.body.note || '';
  await u.save();

  // Send email notification to uploader
  if (u.uploader?.email) {
    sendRejectionEmail({
      toEmail:   u.uploader.email,
      toName:    u.uploader.name || 'User',
      fileTitle: u.title || u.fileName,
      reason:    req.body.note || '',
    }).catch(err => console.error('Mail error:', err.message));
  }

  res.json({ success: true, upload: u });
});

module.exports = router;
// GET /api/admin/stats
router.get('/stats', ensureAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const User   = require('../models/User');
    const Course = require('../routes/courses').Course || mongoose.model('Course');
    const [pending, approved, rejected, total, users] = await Promise.all([
      Upload.countDocuments({ status: 'pending' }),
      Upload.countDocuments({ status: 'approved' }),
      Upload.countDocuments({ status: 'rejected' }),
      Upload.countDocuments(),
      User.countDocuments(),
    ]);
    res.json({ pending, approved, rejected, total, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/uploads?status=pending|approved|rejected&page=1
router.get('/uploads', ensureAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  try {
    const [uploads, total] = await Promise.all([
      Upload.find(filter)
        .populate('uploader', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Upload.countDocuments(filter),
    ]);
    res.json({ uploads, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/uploads/:id
router.delete('/uploads/:id', ensureAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) return res.status(404).json({ error: 'Not found' });

    // Delete from Supabase storage
    if (upload.fileUrl && upload.fileUrl.includes('supabase')) {
      const fileName = upload.fileUrl.split('/').pop();
      await supabase.storage.from('studyhub-uploads').remove([fileName]);
    }

    await Upload.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
