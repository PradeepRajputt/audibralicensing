
import mongoose, { Schema, Document, models, Model } from 'mongoose';
import type { User } from '@/lib/types';

export interface IUser extends Omit<User, 'id'>, Document {}

const UserSchema: Schema = new Schema({
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false }, // Don't return password by default
  role: { type: String, enum: ['creator', 'admin'], default: 'creator' },
  joinDate: { type: String, default: () => new Date().toISOString() },
  platformsConnected: { type: [String], default: [] },
  youtubeChannelId: { type: String },
  status: { type: String, enum: ['active', 'suspended', 'deactivated'], default: 'active' },
  avatar: { type: String },
  legalFullName: { type: String },
  address: { type: String },
  phone: { type: String },
});


// Mongoose virtuals are a good way to transform the _id field into id
UserSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

// Ensure virtuals are included in toJSON and toObject outputs
UserSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
    }
});
UserSchema.set('toObject', {
    virtuals: true,
     transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
    }
});

export default (models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
