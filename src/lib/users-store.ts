
'use server';
import type { User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

const mockUsers: User[] = [
    { uid: 'user_creator_123', displayName: 'Sample Creator', email: 'creator@example.com', phone: '', passwordHash: '', role: 'creator', joinDate: '2024-01-15T12:00:00.000Z', status: 'active', platformsConnected: ['youtube'], youtubeChannelId: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw', avatar: 'https://placehold.co/128x128.png', legalFullName: 'Sample Creator', address: '123 Creator Lane' },
    { uid: 'user_creator_456', displayName: 'Alice Vlogs', email: 'alice@example.com', phone: '', passwordHash: '', role: 'creator', joinDate: '2024-02-20T12:00:00.000Z', status: 'active', platformsConnected: [], avatar: 'https://placehold.co/128x128.png', legalFullName: 'Alice Vlogger', address: '456 Content Rd' },
    { uid: 'user_creator_789', displayName: 'Bob Builds', email: 'bob@example.com', phone: '', passwordHash: '', role: 'creator', joinDate: '2024-03-10T12:00:00.000Z', status: 'suspended', platformsConnected: ['instagram'], avatar: 'https://placehold.co/128x128.png', legalFullName: 'Bob Builder', address: '789 DIY Street' },
];

export async function getAllUsers(): Promise<User[]> {
  noStore();
  console.log("MOCK: Fetching all users.");
  return Promise.resolve(mockUsers);
}

export async function getUserById(uid: string): Promise<User | undefined> {
  noStore();
  console.log(`MOCK: Fetching user by ID: ${uid}`);
  return Promise.resolve(mockUsers.find(u => u.uid === uid));
}

export async function updateUser(uid: string, updates: Partial<Omit<User, 'uid'>>): Promise<void> {
    noStore();
    console.log(`MOCK: Updating user ${uid} with`, updates);
    const userIndex = mockUsers.findIndex(u => u.uid === uid);
    if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    } else {
        // If user doesn't exist, create a new one (upsert behavior)
        const newUser: User = {
            uid,
            email: updates.email || `${uid}@example.com`,
            displayName: updates.displayName || 'New User',
            role: 'creator',
            status: 'active',
            joinDate: new Date().toISOString(),
            platformsConnected: [],
            avatar: 'https://placehold.co/128x128.png',
            phone: '',
            passwordHash: '',
            ...updates,
        };
        mockUsers.push(newUser);
        console.log(`MOCK: User not found, created new user ${uid}`);
    }
}


export async function updateUserStatus(uid: string, status: User['status']): Promise<void> {
    noStore();
    console.log(`MOCK: Updating status for ${uid} to ${status}`);
    const user = mockUsers.find(u => u.uid === uid);
    if(user) user.status = status;
}

export async function disconnectYoutubeChannel(userId: string): Promise<void> {
    noStore();
    const userIndex = mockUsers.findIndex(u => u.uid === userId);
    if (userIndex !== -1) {
        mockUsers[userIndex].youtubeChannelId = undefined;
        mockUsers[userIndex].platformsConnected = mockUsers[userIndex].platformsConnected.filter(
            (p) => p !== 'youtube'
        );
        console.log(`MOCK: Disconnected YouTube channel for user ${userId}`);
    } else {
        console.warn(`MOCK: Could not find user ${userId} to disconnect.`);
    }
}
