import connectToDatabase from './mongodb';
import Creator from '../models/Creator';
import type { User } from './types';

export async function getAllUsers(): Promise<User[]> {
  await connectToDatabase();
  const creators = await Creator.find({}).lean();
  return creators.map((creator: any) => ({
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
    status: 'active',
    avatar: creator.avatar,
    legalFullName: undefined,
    address: undefined,
    phone: undefined,
    accessToken: undefined,
    youtubeChannel: creator.youtubeChannel,
  }));
} 