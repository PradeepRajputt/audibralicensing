import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  sessionId: { type: String, unique: true, required: true },
  device: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
}, { collection: 'sessions' });

const Session = (mongoose.models && mongoose.models.Session)
  ? mongoose.models.Session
  : mongoose.model('Session', sessionSchema);

export default Session; 