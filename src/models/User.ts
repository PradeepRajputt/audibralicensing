import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ['creator', 'admin'], default: 'creator' },
    joinDate: { type: String, default: () => new Date().toISOString() },
    platformsConnected: { type: [String], default: [] },
    youtubeChannelId: { type: String },
    status: { type: String, enum: ['active', 'suspended', 'deactivated'], default: 'active' },
    avatar: { type: String },
    legalFullName: { type: String },
    address: { type: String },
    phone: { type: String },
    // New fields for OTP and PIN auth
    emailOtpHash: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    backupPinHash: { type: String, select: false },
  },
  { timestamps: true }
);

// This transform ensures the client-side User type matches by converting _id to id.
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export default UserModel;
