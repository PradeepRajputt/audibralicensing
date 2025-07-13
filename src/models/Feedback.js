import mongoose from 'mongoose';

const singleFeedbackSchema = new mongoose.Schema({
  type: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const feedbackSchema = new mongoose.Schema({
  creatorEmail: { type: String, required: true, unique: true },
  creatorName: { type: String },
  feedbacks: [singleFeedbackSchema],
}, { collection: 'feedbacks' });

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

export default Feedback; 