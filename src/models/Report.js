import mongoose from 'mongoose';

const singleReportSchema = new mongoose.Schema({
  platform: { type: String, enum: ['youtube', 'instagram', 'web', 'tiktok'], required: true },
  status: { type: String, enum: ['in_review', 'approved', 'rejected', 'action_taken'], default: 'in_review' },
  reason: { type: String, required: true },
  submitted: { type: Date, default: Date.now },
  originalContentUrl: { type: String },
  suspectUrl: { type: String },
});

const reportSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true, unique: true },
  reports: [singleReportSchema],
});

const Report = (mongoose.models && mongoose.models.Report) || mongoose.model('Report', reportSchema);

export default Report; 