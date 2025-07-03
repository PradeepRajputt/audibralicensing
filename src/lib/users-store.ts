
'use server';
import type { User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import bcrypt from 'bcryptjs';

// Mock in-memory database for users
let mockUsers: User[] = [
    {
        id: 'user_admin_123',
        displayName: 'Admin User',
        email: 'admin@creatorshield.com',
        password: '', // Will be set below
        role: 'admin',
        joinDate: new Date('2024-01-01T10:00:00Z').toISOString(),
        platformsConnected: [],
        status: 'active',
        avatar: 'https://placehold.co/128x128.png?text=AD',
        legalFullName: 'Admin Istrator',
        address: '123 Admin Way, Suite 100, Sysville, 90210',
        phone: '555-123-4567',
    },
    {
        id: 'user_creator_123',
        displayName: 'Sample Creator',
        email: 'creator@example.com',
        password: '', // Will be set below
        role: 'creator',
        joinDate: new Date('2024-01-15T10:00:00Z').toISOString(),
        platformsConnected: ['youtube'],
        youtubeChannelId: 'UC-lHJZR3Gqxm24_Vd_AJ5Yw', // Google's channel
        status: 'active',
        avatar: 'https://placehold.co/128x128.png?text=SC',
        legalFullName: 'Sample Creator',
        address: '456 Creator Ave, Content City, 12345',
        phone: '555-987-6543',
    },
    {
        id: 'user_creator_456',
        displayName: 'Alice Vlogs',
        email: 'alice@example.com',
        password: '', // Will be set below
        role: 'creator',
        joinDate: new Date('2024-02-20T10:00:00Z').toISOString(),
        platformsConnected: ['instagram'],
        status: 'active',
        avatar: 'https://placehold.co/128x128.png?text=AV',
    },
    {
        id: 'user_creator_789',
        displayName: 'Bob Builds',
        email: 'bob@example.com',
        password: '', // Will be set below
        role: 'creator',
        joinDate: new Date('2024-03-10T10:00:00Z').toISOString(),
        platformsConnected: [],
        status: 'suspended',
        avatar: 'https://placehold.co/128x128.png?text=BB',
    },
     {
        id: 'user_creator_xyz',
        displayName: 'Deleted User',
        email: 'deleted@example.com',
        password: '', // Will be set below
        role: 'creator',
        joinDate: new Date('2024-03-15T10:00:00Z').toISOString(),
        platformsConnected: [],
        status: 'deactivated',
        avatar: 'https://placehold.co/128x128.png?text=DU',
    }
];

// Hash passwords for mock users on startup
(async () => {
    for (const user of mockUsers) {
        if (!user.password) {
            user.password = await bcrypt.hash('password123', 10);
        }
    }
})();

const sanitizeUser = (user: User): Omit<User, 'password'> => {
  const { password, ...safeUser } = user;
  return safeUser;
};

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  noStore();
  return Promise.resolve(mockUsers.map(sanitizeUser));
}

export async function getUserById(id: string): Promise<User | null> {
  noStore();
  if (!id) return null;
  const user = mockUsers.find(u => u.id === id);
  return Promise.resolve(user ? { ...user } : null);
}

export async function getUserByEmail(email: string): Promise<User | null> {
    noStore();
    if (!email) return null;
    const user = mockUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
    return Promise.resolve(user ? { ...user } : null);
}

export async function createUser(data: Pick<User, 'email' | 'displayName' | 'password'> & { role?: User['role'] }) {
    noStore();
    const existingUser = await getUserByEmail(data.email!);
    if (existingUser) {
        throw new Error("User with this email already exists.");
    }
    
    const hashedPassword = await bcrypt.hash(data.password!, 10);

    const newUser: User = {
        id: `user_new_${Date.now()}`,
        email: data.email,
        displayName: data.displayName,
        password: hashedPassword,
        role: data.role || 'creator',
        joinDate: new Date().toISOString(),
        status: 'active',
        platformsConnected: [],
        avatar: `https://placehold.co/128x128.png?text=${data.displayName?.charAt(0)}`
    };

    mockUsers.unshift(newUser);
    return sanitizeUser(newUser);
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id' | 'password'>>): Promise<void> {
    noStore();
    mockUsers = mockUsers.map(user => 
        user.id === id ? { ...user, ...updates } : user
    );
    console.log(`Updated user ${id}.`);
}

export async function updateUserStatus(id: string, status: User['status']): Promise<void> {
    noStore();
    await updateUser(id, { status });
}
