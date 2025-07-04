
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { User } from '@/lib/types';

const UserSchemaFields: Record<keyof Omit<User, 'id'>, any> = {
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['creator', 'admin'], default: 'creator' },
  joinDate: { type: String, default: () => new Date().toISOString() },
  platformsConnected: { type: [String], default: [] },
  youtubeChannelId: { type: String },
  status: { type: String, enum: ['active', 'suspended', 'deactivated'], default: 'active' },
  avatar: { type: String },
  legalFullName: { type: String },
  address: { type: String },
  phone: { type: String },
};

const UserSchema = new Schema(UserSchemaFields);

// Although we use .lean() which doesn't run transforms, this is good practice
// for any scenario where the document object itself might be serialized.
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password; // Safeguard to ensure password hash is never sent
    return ret;
  },
});

const UserModel = (models.User as Model<User>) || mongoose.model<User>('User', UserSchema);

export default UserModel;
