import connectToDatabase from './mongodb';
import Creator from '../models/Creator.js';
import type { User } from './types';

export async function getAllUsers(): Promise<User[]> {
  await connectToDatabase();
  // @ts-ignore
  const creators = await Creator.find({}).lean();
  return creators.map((creator: any) => ({
    id: creator._id.toString(),
    uid: creator._id.toString(),
    name: creator.name,
    displayName: creator.displayName || creator.name, // Use updated displayName if available
    email: creator.email,
    image: creator.avatar || null,
    role: 'creator',
    joinDate: creator.createdAt ? new Date(creator.createdAt).toISOString() : '',
    platformsConnected: creator.youtubeChannel ? ['youtube'] : [],
    youtubeChannelId: creator.youtubeChannel?.id,
    status: creator.status || 'active',
    avatar: creator.avatar,
    legalFullName: undefined,
    address: undefined,
    phone: undefined,
    accessToken: undefined,
    youtubeChannel: creator.youtubeChannel,
  }));
}

export async function getUserByEmail(email: string) {
  await connectToDatabase();
  // @ts-ignore
  return Creator.findOne({ email }).lean();
}

export async function updateUserStatus(userId: string, status: 'active' | 'suspended' | 'deactivated') {
  await connectToDatabase();
  // @ts-ignore
  return Creator.updateOne({ _id: userId }, { $set: { status } });
}

export async function updateUser(userId: string, update: Partial<any>) {
  console.log('🔄 updateUser called with:', { userId, update });
  await connectToDatabase();
  // @ts-ignore
  const result = await Creator.updateOne({ _id: userId }, { $set: update });
  console.log('📝 Database update result:', result);
  return result;
}

export async function getUserById(userId: string) {
  await connectToDatabase();
  // Check if userId is a valid ObjectId
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return undefined;
  }
  // @ts-ignore
  const creator = await Creator.findById(userId).lean();
  
  if (!creator) return undefined;
  
  return {
    id: creator._id.toString(),
    uid: creator._id.toString(),
    name: creator.name,
    displayName: creator.name,
    email: creator.email,
    image: creator.avatar || null,
    role: 'creator',
    joinDate: creator.createdAt ? new Date(creator.createdAt).toISOString() : '',
    platformsConnected: creator.youtubeChannel ? ['youtube'] : [],
    youtubeChannelId: creator.youtubeChannel?.id,
    status: creator.status || 'active',
    avatar: creator.avatar,
    legalFullName: undefined,
    address: undefined,
    phone: undefined,
    accessToken: undefined,
    youtubeChannel: creator.youtubeChannel,
  };
} 