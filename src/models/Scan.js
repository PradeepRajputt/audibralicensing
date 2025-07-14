import mongoose from 'mongoose';

const singleScanSchema = new mongoose.Schema({
  pageUrl: { type: String, required: true },
  scanType: { type: String, enum: ['text', 'image', 'audio', 'video'], required: true },
  status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
  matchFound: { type: Boolean, default: false },
  matchScore: { type: Number },
  timestamp: { type: Date, default: Date.now },
});

const scanSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true, unique: true },
  scans: [singleScanSchema],
});

const Scan = (mongoose.models && mongoose.models.Scan) || mongoose.model('Scan', scanSchema);

export default Scan; 