import mongoose from 'mongoose';

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


const scanSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  originalVideo: {
    url: { type: String, required: true },
    title: { type: String },
    audioHash: { type: String },
    videoHash: { type: String },
    transcriptEmbedding: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  scans: [singleScanSchema], // Each scan attempt for this original video
});

const Scan = (mongoose.models && mongoose.models.Scan) || mongoose.model('Scan', scanSchema);

export default Scan; 