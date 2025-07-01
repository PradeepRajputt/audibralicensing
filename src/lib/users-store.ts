
'use server';

import type { User } from '@/lib/types';
import { addReactivationRequest } from './reactivations-store';
import { unstable_noStore as noStore } from 'next/cache';

// In-memory array to store users
let users: User[] = [
  {
    uid: "user_admin_001",
    displayName: "Admin User",
    email: "admin@creatorshield.com",
    passwordHash: "hashed_password_admin", // In a real app, this would be a secure hash
    role: 'admin',
    joinDate: new Date('2024-01-01T10:00:00Z').toISOString(),
    platformsConnected: [],
    status: 'active',
    avatar: 'https://placehold.co/128x128.png',
  },
  {
    uid: "user_creator_123",
    displayName: "Sample Creator",
    email: "creator@example.com",
    passwordHash: "hashed_password_creator",
    role: 'creator',
    joinDate: new Date('2024-01-15T10:00:00Z').toISOString(),
    platformsConnected: [],
    youtubeChannelId: undefined, 
    status: 'active',
    avatar: 'https://placehold.co/128x128.png',
  },
  {
    uid: "user_creator_456",
    displayName: "Alice Vlogs",
    email: "alice@example.com",
    passwordHash: "hashed_password_alice",
    role: 'creator',
    joinDate: new Date('2024-02-20T10:00:00Z').toISOString(),
    platformsConnected: [],
    status: 'active',
    avatar: 'https://placehold.co/128x128.png',
  },
  {
    uid: "user_creator_789",
    displayName: "Bob Builds",
    email: "bob@example.com",
    passwordHash: "hashed_password_bob",
    role: 'creator',
    joinDate: new Date('2024-03-10T10:00:00Z').toISOString(),
    platformsConnected: ['instagram', 'tiktok'],
    status: 'suspended',
    avatar: 'https://placehold.co/128x128.png',
  },
];


/**
 * Retrieves all user documents from the in-memory store.
 * @returns A promise that resolves to an array of User objects.
 */
export async function getAllUsers(): Promise<User[]> {
  noStore();
  // Simulate DB async operation and return a deep copy
  return JSON.parse(JSON.stringify(users.sort((a,b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())));
}

/**
 * Retrieves a single user document by its UID from the in-memory store.
 * @param uid The user's unique ID.
 * @returns A promise that resolves to the User object or undefined if not found.
 */
export async function getUserById(uid: string): Promise<User | undefined> {
  noStore();
  const user = users.find(u => u.uid === uid);
  return user ? JSON.parse(JSON.stringify(user)) : undefined;
}

/**
 * Updates a user's status in the in-memory store.
 * @param uid The ID of the user to update.
 * @param status The new status for the user.
 */
export async function updateUserStatus(uid: string, status: 'active' | 'suspended' | 'deactivated'): Promise<void> {
    noStore();
    const userIndex = users.findIndex(u => u.uid === uid);
    if (userIndex !== -1) {
        users[userIndex].status = status;
        if (status === 'deactivated') {
          await addReactivationRequest({
            creatorId: users[userIndex].uid,
            displayName: users[userIndex].displayName || 'Unknown',
            email: users[userIndex].email || 'no-email@provided.com',
            avatar: users[userIndex].avatar,
          });
        }
        console.log(`Updated status for user ${uid} to ${status}`);
    } else {
        console.error(`User with UID ${uid} not found.`);
        throw new Error('User not found.');
    }
}

/**
 * Updates a user's profile details (like YouTube channel info)
 * @param uid The ID of the user to update.
 * @param updates The partial user data to update.
 */
export async function updateUser(uid: string, updates: Partial<User>): Promise<void> {
    noStore();
    const userIndex = users.findIndex(u => u.uid === uid);
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        console.log(`Updated user ${uid} with new data.`);
    } else {
         console.error(`User with UID ${uid} not found for update.`);
        throw new Error('User not found.');
    }
}

/**
 * Removes the YouTube channel connection from a user.
 */
export async function disconnectYoutubeChannel(uid: string): Promise<void> {
    noStore();
    const userIndex = users.findIndex(u => u.uid === uid);
    if (userIndex > -1) {
        users[userIndex].youtubeChannelId = undefined;
        users[userIndex].platformsConnected = users[userIndex].platformsConnected.filter(p => p !== 'youtube');
    } else {
        throw new Error("User not found for disconnect.");
    }
}
