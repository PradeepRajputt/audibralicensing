import mongoose from 'mongoose';

const StrikeSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

const Strike = (mongoose.models && mongoose.models.Strike)
  ? mongoose.models.Strike
  : mongoose.model('Strike', StrikeSchema);

export default Strike; 