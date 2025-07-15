import mongoose from 'mongoose';

const violationSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  originalContentTitle: { type: String, required: true },
  originalContentUrl: { type: String, required: true },
  infringingContentSnippet: { type: String },
  matchedURL: { type: String, required: true },
  platform: { type: String, enum: ['youtube', 'web', 'instagram', 'tiktok'], required: true },
  matchScore: { type: Number, required: true },
  detectedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending_review', 'action_taken', 'dismissed'], default: 'pending_review' },
  timeline: [
    {
      status: { type: String },
      date: { type: Date, default: Date.now },
    }
  ],
});

const Violation = (mongoose.models && mongoose.models.Violation) || mongoose.model('Violation', violationSchema);

export default Violation; 