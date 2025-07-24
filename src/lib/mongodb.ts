import dotenv from 'dotenv';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
let mongoose = require('mongoose');

// Debug: check what is imported
// console.log('Mongoose import:', mongoose);

// Handle ESM/CJS interop: get .default if present
if (mongoose && typeof mongoose.connect !== 'function' && mongoose.default && typeof mongoose.default.connect === 'function') {
  mongoose = mongoose.default;
}

const MONGODB_URI = "mongodb+srv://creators_shield:Creatorshield%40005@cluster0.gvezzd8.mongodb.net/creator_shield_db?retryWrites=true&w=majority&appName=Cluster0";

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env or .env.local')
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    if (typeof mongoose.connect !== 'function') {
      throw new Error('mongoose.connect is not a function. Mongoose import problem.');
    }
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectToDatabase;
