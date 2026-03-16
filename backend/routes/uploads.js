const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const Upload = require('../models/Upload');
const { ensureAuth } = require('../middleware/auth');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

const parser = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// POST /api/uploads — requires auth
router.post('/', ensureAuth, parser.single('file'), async (req, res) => {
  const { title, description, subjectSlug, type } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ success: false, error: 'No file provided' });

  try {
    const fileName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
    const { error } = await supabase.storage
      .from('studyhub-uploads')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) throw new Error(error.message);

    const { data: { publicUrl } } = supabase.storage
      .from('studyhub-uploads')
      .getPublicUrl(fileName);

    const newUpload = await Upload.create({
      title:       title || file.originalname,
      description: description || '',
      subjectSlug,
      type,
      fileUrl:     publicUrl,
      fileName:    file.originalname,
      uploader:    req.user._id,
    });

    res.json({ success: true, upload: newUpload });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/uploads — public, only approved
router.get('/', async (req, res) => {
  const { subjectSlug, type } = req.query;
  const filter = { status: 'approved' };
  if (subjectSlug) filter.subjectSlug = subjectSlug;
  if (type) filter.type = type;
  try {
    const uploads = await Upload.find(filter)
      .populate('uploader', 'name')
      .sort({ createdAt: -1 });
    res.json({ uploads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/uploads/pending — admin only
router.get('/pending', ensureAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const pending = await Upload.find({ status: 'pending' }).populate('uploader', 'name email');
  res.json(pending);
});

// GET /api/uploads/mine — current user's uploads with status
router.get('/mine', ensureAuth, async (req, res) => {
  try {
    const uploads = await Upload.find({ uploader: req.user._id })
      .sort({ createdAt: -1 })
      .select('title fileName fileUrl subjectSlug type status adminNote downloads likes createdAt approvedAt');
    res.json({ uploads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/uploads/stats — public stats for home page
router.get('/stats', async (req, res) => {
  try {
    const User = require('../models/User');
    const [total, approved, users] = await Promise.all([
      Upload.countDocuments(),
      Upload.countDocuments({ status: 'approved' }),
      User.countDocuments(),
    ]);
    res.json({ total, approved, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/uploads/:id/download — increment download count (no auth required)
router.post('/:id/download', async (req, res) => {
  try {
    const upload = await Upload.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    if (!upload) return res.status(404).json({ error: 'Not found' });
    res.json({ downloads: upload.downloads });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/uploads/:id/like — toggle like, requires auth
router.post('/:id/like', ensureAuth, async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) return res.status(404).json({ error: 'Not found' });
    const userId = req.user._id.toString();
    const alreadyLiked = upload.likes.map(l => l.toString()).includes(userId);
    if (alreadyLiked) {
      upload.likes = upload.likes.filter(l => l.toString() !== userId);
    } else {
      upload.likes.push(req.user._id);
    }
    await upload.save();
    res.json({ likes: upload.likes.length, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
