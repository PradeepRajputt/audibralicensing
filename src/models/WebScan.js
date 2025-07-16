import mongoose from 'mongoose';

const webScanSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Changed from ObjectId to String
  pageUrl: { type: String, required: true },
  scanType: { type: String, enum: ['text', 'image', 'video'], required: true },
  status: { type: String, enum: ['completed', 'failed'], required: true },
  matchFound: { type: Boolean, required: true },
  matchScore: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

const WebScan = (mongoose.models && mongoose.models.WebScan) || mongoose.model('WebScan', webScanSchema);

export default WebScan; 