const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  level: { type: String, enum: ['jhs','shs','university'] },
  title: String,
  slug: String,
  meta: Object // extra fields; for university: { faculty: 'Business School' }
});

module.exports = mongoose.model('Subject', subjectSchema);