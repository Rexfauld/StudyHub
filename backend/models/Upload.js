const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  title: String,
  description: String,
  subjectSlug: String,
  type: { type: String, enum: ['book','topic','questions','photo','other'], default: 'other' },
  fileUrl: String,
  fileName: String,
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  adminNote: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  approvedAt: Date
});

module.exports = mongoose.model('Upload', uploadSchema);
