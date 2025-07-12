import mongoose from 'mongoose';

const ScanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  pageUrl: { type: String, required: true },
  scanType: { type: String, enum: ['text', 'image'], required: true },
  status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
  matchFound: { type: Boolean, default: false },
  matchScore: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

const Scan = (mongoose.models && mongoose.models.Scan)
  ? mongoose.models.Scan
  : mongoose.model('Scan', ScanSchema);

export default Scan; 