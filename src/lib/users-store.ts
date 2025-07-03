
'use server';

import type { User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

// Mock in-memory database for users
let mockUsers: User[] = [
  {
    uid: 'user_admin_123',
    displayName: 'Admin User',
    email: 'admin@creatorshield.com',
    role: 'admin',
    joinDate: new Date('2024-01-01T10:00:00Z').toISOString(),
    platformsConnected: [],
    status: 'active',
    avatar: 'https://placehold.co/128x128.png',
    legalFullName: 'Admin Admin',
    address: '123 Admin Way, Suite 404, Internet',
    phone: '555-0101'
  },
  {
    uid: 'user_creator_123',
    displayName: 'Sample Creator',
    email: 'creator@example.com',
    role: 'creator',
    joinDate: new Date('2024-01-15T14:30:00Z').toISOString(),
    platformsConnected: ['youtube'],
    youtubeChannelId: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw', // Example Channel ID
    status: 'active',
    avatar: 'https://placehold.co/128x128.png'
  },
   {
    uid: 'user_creator_456',
    displayName: 'Alice Vlogs',
    email: 'alice@example.com',
    role: 'creator',
    joinDate: new Date('2024-02-20T11:00:00Z').toISOString(),
    platformsConnected: [],
    status: 'active',
    avatar: 'https://placehold.co/128x128.png'
  },
  {
    uid: 'user_creator_789',
    displayName: 'Bob Builds',
    email: 'bob@example.com',
    role: 'creator',
    joinDate: new Date('2024-03-10T09:00:00Z').toISOString(),
    platformsConnected: ['youtube'],
    youtubeChannelId: 'UC-sample-channel-id-2',
    status: 'suspended',
    avatar: 'https://placehold.co/128x128.png'
  },
  {
    uid: 'user_creator_xyz',
    displayName: 'Deleted User',
    email: 'deleted@example.com',
    role: 'creator',
    joinDate: new Date('2024-04-01T18:00:00Z').toISOString(),
    platformsConnected: [],
    status: 'deactivated',
    avatar: 'https://placehold.co/128x128.png'
  }
];

export async function getAllUsers(): Promise<User[]> {
  noStore();
  // In a real app, this would be: await db.collection('users').find().toArray();
  return Promise.resolve(mockUsers);
}

export async function getUserById(uid: string): Promise<User | undefined> {
  noStore();
  // In a real app, this would be: await db.collection('users').findOne({ uid });
  const user = mockUsers.find(u => u.uid === uid);
  return Promise.resolve(user);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
    noStore();
    // In a real app, this would be: await db.collection('users').findOne({ email });
    const user = mockUsers.find(u => u.email === email);
    return Promise.resolve(user);
}

export async function createUserInFirestore(data: {
    uid: string;
    email: string;
    displayName: string;
    role: 'creator' | 'admin';
}) {
    noStore();
    const existingUser = mockUsers.find(u => u.uid === data.uid || u.email === data.email);
    if (existingUser) {
        throw new Error("User already exists.");
    }
    const newUser: User = {
        ...data,
        joinDate: new Date().toISOString(),
        status: 'active',
        platformsConnected: [],
        avatar: `https://placehold.co/128x128.png?text=${data.displayName.charAt(0)}`
    }
    // In a real app, this would be: await db.collection('users').insertOne(newUser);
    mockUsers.push(newUser);
    return newUser;
}

export async function updateUser(uid: string, updates: Partial<Omit<User, 'uid'>>): Promise<void> {
    noStore();
    // In a real app, this would be: await db.collection('users').updateOne({ uid }, { $set: updates });
    mockUsers = mockUsers.map(u => u.uid === uid ? { ...u, ...updates } : u);
    console.log(`MOCK: Updated user ${uid}. New data:`, mockUsers.find(u => u.uid === uid));
}

export async function updateUserStatus(uid: string, status: User['status']): Promise<void> {
    noStore();
    // In a real app, this would be: await db.collection('users').updateOne({ uid }, { $set: { status } });
    mockUsers = mockUsers.map(u => u.uid === uid ? { ...u, status } : u);
}

export async function disconnectYoutubeChannel(userId: string): Promise<void> {
    noStore();
    mockUsers = mockUsers.map(u => {
        if (u.uid === userId) {
            const { youtubeChannelId, ...rest } = u;
            const newPlatforms = u.platformsConnected.filter(p => p !== 'youtube');
            return { ...rest, platformsConnected: newPlatforms };
        }
        return u;
    });
}
