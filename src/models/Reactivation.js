import mongoose from 'mongoose';

const ReactivationSchema = new mongoose.Schema({
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String },
  requestDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

const Reactivation = (mongoose.models && mongoose.models.Reactivation)
  ? mongoose.models.Reactivation
  : mongoose.model('Reactivation', ReactivationSchema);

export default Reactivation; 