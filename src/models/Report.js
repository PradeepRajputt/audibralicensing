import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  platform: { type: String, enum: ['youtube', 'instagram', 'web', 'tiktok'], required: true },
  status: { type: String, enum: ['in_review', 'approved', 'rejected', 'action_taken'], default: 'in_review' },
  reason: { type: String, required: true },
  submitted: { type: Date, default: Date.now },
  originalContentUrl: { type: String },
  suspectUrl: { type: String }
});

const Report = (mongoose.models && mongoose.models.Report)
  ? mongoose.models.Report
  : mongoose.model('Report', ReportSchema);

export default Report; 