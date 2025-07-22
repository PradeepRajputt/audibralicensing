import mongoose from 'mongoose';

const OriginalVideoSchema = new mongoose.Schema({
  url: String,
  title: String,
  audioHash: String,
  videoHash: String,
  transcriptEmbedding: String,
  submittedAt: { type: Date, default: Date.now }
}, { _id: false });

const matchSchema = new mongoose.Schema({
  matchedUrl: { type: String, required: true },
  matchedTitle: { type: String },
  matchType: { type: String, enum: ['text', 'audio', 'video'], required: true },
  matchScore: { type: Number },
  detectedAt: { type: Date, default: Date.now },
});

const singleScanSchema = new mongoose.Schema({
  scanType: { type: String, enum: ['text', 'audio', 'video'], required: true },
  status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
  timestamp: { type: Date, default: Date.now },
  matches: [matchSchema], // Only matched videos are stored here
});


const ScanSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator' },
  // Max 10 objects, enforced in logic
  originalVideo: { type: [OriginalVideoSchema], default: [] },
  // Max 25 objects, enforced in logic
  scans: { type: [mongoose.Schema.Types.Mixed], default: [] }
});

const Scan = (mongoose.models && mongoose.models.Scan) || mongoose.model('Scan', ScanSchema);

export default Scan; 