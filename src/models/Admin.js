import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // hashed password for admin
  location: { type: String, required: true },
  youtubeChannel: {
    id: String,
    title: String,
    thumbnail: String,
  },
});

export default mongoose.models.Admin || mongoose.model('Admin', adminSchema); 