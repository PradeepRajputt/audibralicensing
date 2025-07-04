import mongoose, { Schema, Document, models } from 'mongoose';

const UserSchema = new Schema(
  {
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['creator', 'admin'], default: 'creator' },
    joinDate: { type: String, default: () => new Date().toISOString() },
    platformsConnected: { type: [String], default: [] },
    status: { type: String, enum: ['active', 'suspended', 'deactivated'], default: 'active' },
    avatar: { type: String },
  },
  { timestamps: true }
);

UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

const UserModel = models.User || mongoose.model('User', UserSchema);
export default UserModel;
