
'use server';
import type { User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

// Mock in-memory database for users
let mockUsers: User[] = [
    { 
        id: 'user_creator_123',
        uid: 'user_creator_123',
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
        id: 'admin_user_id', // A stable ID for the admin
        uid: 'admin_user_id',
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


export async function createUser(data: Omit<User, 'joinDate' | 'status' | 'platformsConnected'| 'avatar' | 'uid'> & { image?: string | null }): Promise<User> {
    noStore();
    const existingUser = mockUsers.find(u => u.email === data.email);
    if (existingUser) {
        console.log("MOCK: User already exists, returning existing user.");
        return existingUser;
    }

    const newUser: User = {
        name: data.name,
        displayName: data.displayName,
        email: data.email,
        role: data.role,
        id: data.id,
        uid: data.id,
        joinDate: new Date().toISOString(),
        status: 'active',
        platformsConnected: [],
        avatar: data.image ?? 'https://placehold.co/128x128.png',
    };
    mockUsers.push(newUser);
    console.log("MOCK: Creating new user", newUser);
    return newUser;
}


export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'uid'>>): Promise<void> {
    noStore();
    mockUsers = mockUsers.map(u => u.id === id ? { ...u, ...updates } : u);
    console.log(`MOCK: Updated user ${id}`, mockUsers.find(u=> u.id === id));
}

export async function updateUserStatus(id: string, status: User['status']): Promise<void> {
    noStore();
    mockUsers = mockUsers.map(u => u.id === id ? { ...u, status } : u);
     console.log(`MOCK: Updated status for user ${id} to ${status}`);
}
