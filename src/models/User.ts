
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { User } from '@/lib/types';

const UserSchemaFields: Record<keyof Omit<User, 'id'>, any> = {
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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

// Use a transform to present the `_id` field as `id` to match our client-side type.
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password; // Never send password hash to client
    return ret;
  },
});

const UserModel = (models.User as Model<User>) || mongoose.model<User>('User', UserSchema);

export default UserModel;
