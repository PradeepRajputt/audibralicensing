
'use client';

import type { User } from '@/lib/firebase/types';
import { hashPassword } from '@/lib/auth';

const USERS_KEY = 'creator_shield_users';
const MOCK_ADMIN_ID = 'user_admin_001';
const MOCK_CREATOR_ID = 'user_creator_123';
const MOCK_CREATOR_2_ID = 'user_creator_456';
const MOCK_CREATOR_3_ID = 'user_creator_789';


const getInitialUsers = (): User[] => [
  {
    uid: MOCK_ADMIN_ID,
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
    uid: MOCK_CREATOR_ID,
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
      uid: MOCK_CREATOR_2_ID,
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
      uid: MOCK_CREATOR_3_ID,
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
];


function getUsersFromStorage(): User[] {
  if (typeof window === 'undefined') return getInitialUsers();
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(getInitialUsers()));
    return getInitialUsers();
  }
  return JSON.parse(stored);
}

function saveUsersToStorage(users: User[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event('storage'));
}

// --- Data Access Functions ---

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = getUsersFromStorage();
  const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  return user || null;
}

export async function getUserById(uid: string): Promise<User | null> {
    const users = getUsersFromStorage();
    const user = users.find(u => u.uid === uid);
    return user || null;
}


export async function createUser(userData: Omit<User, 'uid' | 'passwordHash'> & { password?: string }): Promise<User> {
  const users = getUsersFromStorage();
  
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

  saveUsersToStorage([...users, dataToStore]);

  return dataToStore;
}

export async function getAllUsers(): Promise<User[]> {
    const users = getUsersFromStorage();
    return users.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
}

export async function updateUserStatus(uid: string, status: 'active' | 'suspended' | 'deactivated'): Promise<void> {
    const users = getUsersFromStorage();
    const updatedUsers = users.map(u => u.uid === uid ? { ...u, status } : u);
    saveUsersToStorage(updatedUsers);
    
    // In a real app this would be a single write, but here we simulate by writing all
    if (typeof window !== 'undefined') {
        const userStatus = localStorage.getItem('user_status');
        if (userStatus && uid === 'user_creator_123') { // Example logic for current user
            localStorage.setItem('user_status', status);
        }
    }
}
