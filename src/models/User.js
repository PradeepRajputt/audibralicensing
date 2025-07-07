import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  location: String,
  youtubeChannel: {
    id: String,
    title: String,
    thumbnail: String,
  },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
