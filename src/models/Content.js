const mongoose = require('mongoose');

const singleContentSchema = new mongoose.Schema({
  contentType: { type: String, enum: ['video', 'audio', 'text', 'image'], required: true },
  videoURL: String,
  title: { type: String, required: true },
  tags: [String],
  platform: { type: String, enum: ['youtube', 'vimeo', 'web'], required: true },
  uploadDate: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  lastChecked: String,
});

const contentSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true, unique: true },
  contents: [singleContentSchema],
});

module.exports = mongoose.models.Content || mongoose.model('Content', contentSchema); 