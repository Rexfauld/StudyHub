const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  provider: { type: String, enum: ['google','github','microsoft','email'], required: true },
  oauthId:  String,
  name:     String,
  email:    String,
  passwordHash: String, // only for email provider
  role:     { type: String, enum: ['user','admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
