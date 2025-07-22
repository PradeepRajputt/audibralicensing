import mongoose from 'mongoose';

const creatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // hashed password
  youtubeChannel: {
    id: String,
    title: String,
    thumbnail: String,
  }, // optional
  youtubeChannelId: { type: String }, // Separate field for easy querying
  avatar: { type: String }, // Add avatar field for profile picture
  status: { type: String, enum: ['active', 'suspended', 'deactivated'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  twoFactorSecret: { type: String },
  twoFactorEnabled: { type: Boolean, default: false },
  // Subscription/payment fields
  plan: { type: String, enum: ['free', 'monthly', 'yearly', 'expired'], default: 'free' },
  trialStart: { type: Date, default: Date.now },
  planExpiry: { type: Date },
  subscriptionId: { type: String }, // Razorpay subscription ID
}, { collection: 'creators' });

const Creator = (mongoose.models && mongoose.models.Creator)
  ? mongoose.models.Creator
  : mongoose.model('Creator', creatorSchema);

export default Creator; 