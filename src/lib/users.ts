
'use server';

import type { User } from '@/lib/firebase/types';
import { hashPassword } from '@/lib/auth';

// In-memory user store for prototype purposes on the SERVER.
// This acts as a mock database. The data is not persistent across server restarts.
let users: User[] = [
    {
        uid: 'user_admin_001',
        displayName: 'Admin User',
        email: 'admin@creatorshield.com',
        passwordHash: '$2a$10$8.B./LpC5g.c5n7b0i.vbu.q5xK.6L7qF.tX.uX/JkZ.xYp1h4i', // aatharv@1111
        role: 'admin',
        joinDate: new Date('2024-01-01').toISOString(),
        platformsConnected: [],
        status: 'active',
        avatar: 'https://placehold.co/128x128.png',
    },
    {
        uid: 'user_creator_123',
        displayName: 'Sample Creator',
        email: 'creator@example.com',
        passwordHash: '$2a$10$8.B./LpC5g.c5n7b0i.vbu.q5xK.6L7qF.tX.uX/JkZ.xYp1h4i', // aatharv@1111
        role: 'creator',
        joinDate: new Date('2024-01-15').toISOString(),
        platformsConnected: ['youtube'],
        youtubeChannelId: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
        status: 'active',
        avatar: 'https://placehold.co/128x128.png',
    },
    {
        uid: 'user_creator_456',
        displayName: 'Alice Vlogs',
        email: 'alice@example.com',
        passwordHash: '$2a$10$8.B./LpC5g.c5n7b0i.vbu.q5xK.6L7qF.tX.uX/JkZ.xYp1h4i',
        role: 'creator',
        joinDate: new Date('2024-02-20').toISOString(),
        platformsConnected: ['instagram'],
        status: 'active',
        avatar: 'https://placehold.co/128x128.png'
    },
    {
        uid: 'user_creator_789',
        displayName: 'Bob Builds',
        email: 'bob@example.com',
        passwordHash: '$2a$10$8.B./LpC5g.c5n7b0i.vbu.q5xK.6L7qF.tX.uX/JkZ.xYp1h4i',
        role: 'creator',
        joinDate: new Date('2024-03-10').toISOString(),
        platformsConnected: ['youtube', 'web'],
        youtubeChannelId: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
        status: 'suspended',
        avatar: 'https://placehold.co/128x128.png'
    }
];

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  return user || null;
}

export async function createUser(userData: Omit<User, 'uid' | 'passwordHash'> & { password?: string }): Promise<User> {
  if (!userData.email) {
    throw new Error("Email is required to create a user.");
  }

  const existingUser = await getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  if (!userData.password) {
    throw new Error("Password is required to create a user.");
  }
  
  const passwordHash = await hashPassword(userData.password);
  
  const newUser: User = {
    ...userData,
    uid: `user_creator_${Date.now()}`,
    passwordHash,
    displayName: userData.displayName || null,
    email: userData.email,
    role: userData.role || 'creator',
    joinDate: new Date().toISOString(),
    platformsConnected: userData.platformsConnected || [],
    status: userData.status || 'active',
    avatar: userData.avatar || `https://placehold.co/128x128.png`,
  };

  const { password, ...dataToStore } = newUser as any;

  users.push(dataToStore);
  
  return dataToStore;
}
