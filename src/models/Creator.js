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
  avatar: { type: String }, // Add avatar field for profile picture
});

export default mongoose.models.Creator || mongoose.model('Creator', creatorSchema); 