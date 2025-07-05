
'use server';
import type { User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import type { Account } from 'next-auth';

// Mock in-memory database for users
let mockUsers: User[] = [
    { 
        id: 'user_creator_123',
        name: 'Sample Creator',
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
        name: 'Admin User',
        displayName: 'Admin User',
        email: 'admin@creatorshield.com',
        role: 'admin',
        joinDate: new Date('2024-01-10T10:00:00Z').toISOString(),
        platformsConnected: [],
        status: 'active',
        avatar: 'https://placehold.co/128x128.png',
    }
];

// In-memory mock for OAuth accounts
let mockAccounts: (Account & { userId: string })[] = [];

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  noStore();
  return Promise.resolve(mockUsers.filter(u => u.role === 'creator'));
}

export async function getUserById(id: string): Promise<User | undefined> {
  noStore();
  return Promise.resolve(mockUsers.find(u => u.id === id));
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  noStore();
  return Promise.resolve(mockUsers.find(u => u.email === email));
}


export async function getUserByAccount({ providerAccountId, provider }: { providerAccountId: string, provider: string }): Promise<User | null> {
    noStore();
    const account = mockAccounts.find(a => a.provider === provider && a.providerAccountId === providerAccountId);
    if (!account) return null;
    const user = mockUsers.find(u => u.id === account.userId);
    return user || null;
}


export async function createUser(data: Omit<User, 'id' | 'joinDate' | 'status' | 'platformsConnected'>): Promise<User> {
    noStore();
    const newUser: User = {
        ...data,
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        joinDate: new Date().toISOString(),
        status: 'active',
        platformsConnected: [],
    };
    mockUsers.push(newUser);
    return newUser;
}


export async function updateUser(id: string, updates: Partial<Omit<User, 'id'>>): Promise<void> {
    noStore();
    mockUsers = mockUsers.map(u => u.id === id ? { ...u, ...updates } : u);
    console.log(`MOCK: Updated user ${id}`, mockUsers.find(u=> u.id === id));
}

export async function linkAccount(account: Account & { userId: string }): Promise<void> {
    noStore();
    // Remove existing link for that user/provider if it exists, then add new one.
    mockAccounts = mockAccounts.filter(a => !(a.userId === account.userId && a.provider === account.provider));
    mockAccounts.push(account);
    console.log(`MOCK: Linked account for user ${account.userId} with provider ${account.provider}`);
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
