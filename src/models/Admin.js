import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // hashed password for admin
  location: { type: String, required: true },
  avatar: { type: Buffer }, // profile picture image data
  youtubeChannel: {
    id: String,
    title: String,
    thumbnail: String,
  },
});

const Admin = (mongoose.models && mongoose.models.Admin) || mongoose.model('Admin', adminSchema);
export default Admin; 