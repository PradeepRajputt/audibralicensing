
import mongoose, { Schema, Document, models } from 'mongoose';
import type { User } from '@/lib/types';

// The IUser interface now directly uses the User type from types.ts, omitting the 'id'
// because it's a virtual provided by Mongoose, not a field in the document.
export interface IUser extends Document, Omit<User, 'id'> {
  password?: string;
}

const UserSchema: Schema = new Schema({
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false }, // Prevent password from being returned by default
  role: { type: String, enum: ['creator', 'admin'], default: 'creator' },
  joinDate: { type: String, default: () => new Date().toISOString() },
  platformsConnected: { type: [String], default: [] },
  youtubeChannelId: { type: String, optional: true },
  status: { type: String, enum: ['active', 'suspended', 'deactivated'], default: 'active' },
  avatar: { type: String, optional: true },
  legalFullName: { type: String, optional: true },
  address: { type: String, optional: true },
  phone: { type: String, optional: true },
});


// Mongoose virtuals are a good way to transform the _id field
UserSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

// Ensure virtuals are included in toJSON and toObject outputs
UserSchema.set('toJSON', {
    virtuals: true
});
UserSchema.set('toObject', {
    virtuals: true
});

export default models.User || mongoose.model<IUser>('User', UserSchema);
