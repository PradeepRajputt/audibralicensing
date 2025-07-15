import mongoose from 'mongoose';

const singleStrikeSchema = new mongoose.Schema({
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
  platform: { type: String },
  suspectUrl: { type: String },
  originalContentUrl: { type: String },
  originalContentTitle: { type: String },
  creatorName: { type: String },
  creatorAvatar: { type: String },
});

const strikeSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true, unique: true },
  strikes: [singleStrikeSchema],
});

const Strike = (mongoose.models && mongoose.models.Strike) || mongoose.model('Strike', strikeSchema);

export default Strike; 