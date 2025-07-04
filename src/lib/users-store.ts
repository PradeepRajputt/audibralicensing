
'use server';
import type { User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

// This is now an in-memory mock store, replacing the database connection.
let mockUsers: User[] = [
  {
    id: 'user_creator_123',
    displayName: 'Sample Creator',
    email: 'creator@example.com',
    role: 'creator',
    joinDate: '2024-01-15T10:00:00.000Z',
    platformsConnected: ['youtube'],
    youtubeChannelId: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw',
    status: 'active',
    avatar: 'https://placehold.co/128x128.png',
  },
  {
    id: 'user_creator_456',
    displayName: 'Alice Vlogs',
    email: 'alice@example.com',
    role: 'creator',
    joinDate: '2024-02-20T11:00:00.000Z',
    platformsConnected: ['instagram'],
    status: 'active',
    avatar: 'https://placehold.co/128x128.png',
  },
  {
    id: 'user_creator_789',
    displayName: 'Bob Builds',
    email: 'bob@example.com',
    role: 'creator',
    joinDate: '2024-03-10T12:00:00.000Z',
    platformsConnected: ['tiktok'],
    status: 'suspended',
    avatar: 'https://placehold.co/128x128.png',
  },
  {
    id: 'user_creator_xyz',
    displayName: 'Deleted User',
    email: 'deleted@example.com',
    role: 'creator',
    joinDate: '2024-01-01T09:00:00.000Z',
    platformsConnected: [],
    status: 'deactivated',
    avatar: 'https://placehold.co/128x128.png',
  },
   {
    id: 'user_admin_123',
    displayName: 'Admin User',
    email: 'admin@creatorshield.com',
    role: 'admin',
    joinDate: '2024-01-01T00:00:00.000Z',
    platformsConnected: [],
    status: 'active',
    avatar: 'https://placehold.co/128x128.png',
  }
];

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  noStore();
  return Promise.resolve(mockUsers.filter(u => u.role === 'creator'));
}

export async function getUserById(id: string): Promise<User | undefined> {
  noStore();
  return Promise.resolve(mockUsers.find(u => u.id === id));
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'password'>>): Promise<void> {
    noStore();
    mockUsers = mockUsers.map(u => u.id === id ? { ...u, ...updates } : u);
    console.log(`MOCK: Updated user ${id}.`);
}

export async function updateUserStatus(id: string, status: User['status']): Promise<void> {
    await updateUser(id, { status });
}
