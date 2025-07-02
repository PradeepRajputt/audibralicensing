
'use server';
import type { User } from '@/lib/types';

const mockUsers: User[] = [
    { uid: 'user_creator_123', displayName: 'Sample Creator', email: 'creator@example.com', phone: '', passwordHash: '', role: 'creator', joinDate: '2024-01-15T12:00:00.000Z', status: 'active', platformsConnected: ['youtube'], youtubeChannelId: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw', avatar: 'https://placehold.co/128x128.png' },
    { uid: 'user_creator_456', displayName: 'Alice Vlogs', email: 'alice@example.com', phone: '', passwordHash: '', role: 'creator', joinDate: '2024-02-20T12:00:00.000Z', status: 'active', platformsConnected: [], avatar: 'https://placehold.co/128x128.png' },
    { uid: 'user_creator_789', displayName: 'Bob Builds', email: 'bob@example.com', phone: '', passwordHash: '', role: 'creator', joinDate: '2024-03-10T12:00:00.000Z', status: 'suspended', platformsConnected: ['instagram'], avatar: 'https://placehold.co/128x128.png' },
];

export async function getAllUsers(): Promise<User[]> {
  console.log("MOCK: Fetching all users.");
  return Promise.resolve(mockUsers);
}

export async function getUserById(uid: string): Promise<User | undefined> {
  console.log(`MOCK: Fetching user by ID: ${uid}`);
  return Promise.resolve(mockUsers.find(u => u.uid === uid));
}
// Other functions are no longer needed as auth is removed.
export async function updateUserStatus(uid: string, status: User['status']): Promise<void> {
    console.log(`MOCK: Updating status for ${uid} to ${status}`);
    const user = mockUsers.find(u => u.uid === uid);
    if(user) user.status = status;
}
