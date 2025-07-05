
'use server';
import type { User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

// Mock in-memory database for users
let mockUsers: User[] = [
    { 
        id: 'user_creator_123', 
        displayName: 'Sample Creator',
        email: 'creator@example.com',
        role: 'creator',
        joinDate: new Date('2024-01-15T10:00:00Z').toISOString(),
        platformsConnected: [],
        status: 'active',
        avatar: 'https://placehold.co/128x128.png',
        legalFullName: 'Sample Creator Name',
        address: '123 Creative Lane, Art City, 12345',
        phone: '555-123-4567',
    },
    { 
        id: 'user_admin_123', 
        displayName: 'Admin User',
        email: 'admin@creatorshield.com',
        role: 'admin',
        joinDate: new Date('2024-01-10T10:00:00Z').toISOString(),
        platformsConnected: [],
        status: 'active',
        avatar: 'https://placehold.co/128x128.png',
    },
    { 
        id: 'user_creator_456', 
        displayName: 'Alice Vlogs',
        email: 'alice@example.com',
        role: 'creator',
        joinDate: new Date('2024-02-20T10:00:00Z').toISOString(),
        platformsConnected: ['youtube'],
        youtubeChannelId: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw', // Google's channel for example
        status: 'active',
        avatar: 'https://placehold.co/128x128.png',
    },
    { 
        id: 'user_creator_789', 
        displayName: 'Bob Builds',
        email: 'bob@example.com',
        role: 'creator',
        joinDate: new Date('2024-03-10T10:00:00Z').toISOString(),
        platformsConnected: [],
        status: 'suspended',
        avatar: 'https://placehold.co/128x128.png',
    },
     { 
        id: 'user_creator_xyz', 
        displayName: 'Deleted User',
        email: 'deleted@example.com',
        role: 'creator',
        joinDate: new Date('2024-01-01T10:00:00Z').toISOString(),
        platformsConnected: [],
        status: 'deactivated',
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

export async function updateUser(id: string, updates: Partial<Omit<User, 'id'>>): Promise<void> {
    noStore();
    mockUsers = mockUsers.map(u => u.id === id ? { ...u, ...updates } : u);
    console.log(`MOCK: Updated user ${id}`, mockUsers.find(u=> u.id === id));
}

export async function updateUserStatus(id: string, status: User['status']): Promise<void> {
    noStore();
    mockUsers = mockUsers.map(u => u.id === id ? { ...u, status } : u);
     console.log(`MOCK: Updated status for user ${id} to ${status}`);
}

export async function setBackupPin(userId: string, hashedPin: string): Promise<void> {
    noStore();
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error("User not found to set PIN.");
    }
    mockUsers[userIndex].hashedPin = hashedPin;
    console.log(`MOCK: Backup PIN set for user ${userId}.`);
}
