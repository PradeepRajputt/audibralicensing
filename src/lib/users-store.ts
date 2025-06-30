
import type { User } from '@/lib/firebase/types';
import { hashPassword } from '@/lib/auth';

// This is a simplified, in-memory user store for the prototype.
// It acts as a mock database. The data is NOT persistent across server restarts.
// In a real app, this module would interact with a database like Firestore.
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
        youtubeChannelId: 'UC_x5XG1OV2P6uZZ5FSM9Ttw', // Google for Developers
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
    },
    {
        uid: 'user_creator_xyz',
        displayName: 'Deleted User',
        email: 'deleted@example.com',
        passwordHash: '$2a$10$8.B./LpC5g.c5n7b0i.vbu.q5xK.6L7qF.tX.uX/JkZ.xYp1h4i',
        role: 'creator',
        joinDate: new Date('2024-04-01').toISOString(),
        platformsConnected: [],
        status: 'deactivated',
        avatar: 'https://placehold.co/128x128.png',
    }
];

// --- Data Access Functions (Server-Only) ---

export function getAllUsers(): User[] {
    return users.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
}

export function getUserById(uid: string): User | undefined {
    return users.find(u => u.uid === uid);
}

export function getUserByEmail(email: string): User | undefined {
  return users.find(u => u.email?.toLowerCase() === email.toLowerCase());
}

export async function createUser(userData: Omit<User, 'uid' | 'passwordHash'> & { password: string }): Promise<User> {
  const existingUser = getUserByEmail(userData.email!);
  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }
  
  const passwordHash = await hashPassword(userData.password);
  
  const newUser: User = {
    uid: `user_creator_${Date.now()}`,
    displayName: userData.displayName || null,
    email: userData.email,
    passwordHash,
    role: userData.role || 'creator',
    joinDate: new Date().toISOString(),
    platformsConnected: userData.platformsConnected || [],
    status: userData.status || 'active',
    avatar: userData.avatar || `https://placehold.co/128x128.png`,
  };

  users.push(newUser);
  return newUser;
}


export function updateUserStatus(uid: string, status: 'active' | 'suspended' | 'deactivated'): void {
    const userIndex = users.findIndex(u => u.uid === uid);
    if (userIndex !== -1) {
        users[userIndex].status = status;
    }
}
