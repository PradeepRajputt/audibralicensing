
'use client';
import type { User } from '@/lib/firebase/types';
import { hashPassword } from '@/lib/auth';


const users: User[] = [
  {
    uid: "user_creator_123",
    displayName: "Sample Creator",
    email: "creator@example.com",
    role: "creator",
    joinDate: new Date("2024-01-15").toISOString(),
    avatar: "https://placehold.co/128x128.png",
    platformsConnected: ["youtube", "web"],
    youtubeChannelId: "UC-lHJZR3Gqxm24_Vd_AJ5Yw", // Google Developers channel
    status: "active",
    passwordHash: "$2a$10$3fR.A.9gB6n.4P.t.b.HfeH/6C5f.I8k3g.m6zJ5n.x8I.1QoO9y." // password is 'password'
  },
  {
    uid: "user_creator_456",
    displayName: "Alice Vlogs",
    email: "alice@example.com",
    role: "creator",
    joinDate: new Date("2024-02-20").toISOString(),
    avatar: "https://placehold.co/128x128.png",
    platformsConnected: ["youtube", "instagram"],
    youtubeChannelId: "UC4QobU6STFB0P71PMvOGN5A", // Firebase channel
    status: "active",
    passwordHash: "$2a$10$3fR.A.9gB6n.4P.t.b.HfeH/6C5f.I8k3g.m6zJ5n.x8I.1QoO9y."
  },
  {
    uid: "user_creator_789",
    displayName: "Bob Builds",
    email: "bob@example.com",
    role: "creator",
    joinDate: new Date("2024-03-10").toISOString(),
    avatar: "https://placehold.co/128x128.png",
    platformsConnected: ["web"],
    status: "active",
    passwordHash: "$2a$10$3fR.A.9gB6n.4P.t.b.HfeH/6C5f.I8k3g.m6zJ5n.x8I.1QoO9y."
  },
  {
    uid: "admin_user_001",
    displayName: "Admin User",
    email: "admin@creatorshield.com",
    role: "admin",
    joinDate: new Date("2024-01-01").toISOString(),
    avatar: "https://placehold.co/128x128.png",
    platformsConnected: [],
    status: "active",
    passwordHash: "$2a$10$3fR.A.9gB6n.4P.t.b.HfeH/6C5f.I8k3g.m6zJ5n.x8I.1QoO9y."
  }
];

const USERS_KEY = 'creator_shield_users';

function getUsersFromStorage(): User[] {
  if (typeof window === 'undefined') return users;
  
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return users;
  }
}

function saveUsersToStorage(users: User[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  // Dispatch a storage event to notify other tabs/windows
  window.dispatchEvent(new Event('storage'));
}

export function getAllUsers(): User[] {
    return getUsersFromStorage();
}

export function getUserById(uid: string): User | undefined {
    return getUsersFromStorage().find(u => u.uid === uid);
}

export function getUserByEmail(email: string): User | null {
    const user = getUsersFromStorage().find(u => u.email?.toLowerCase() === email.toLowerCase());
    return user || null;
}

export async function createUser(userData: Omit<User, 'uid' | 'passwordHash'> & { password?: string }): Promise<User> {
    const allUsers = getUsersFromStorage();
    if (getUserByEmail(userData.email!)) {
        throw new Error("An account with this email already exists.");
    }
    const passwordHash = userData.password ? await hashPassword(userData.password) : undefined;
    
    const newUser: User = {
        ...userData,
        uid: `user_${Date.now()}`,
        passwordHash,
    };
    
    saveUsersToStorage([...allUsers, newUser]);
    return newUser;
}


export function updateUserStatus(uid: string, status: 'active' | 'suspended' | 'deactivated') {
    const currentUsers = getUsersFromStorage();
    const updatedUsers = currentUsers.map(user => 
        user.uid === uid ? { ...user, status } : user
    );
    saveUsersToStorage(updatedUsers);
}

// Ensure at least one admin user exists on first load
if (typeof window !== 'undefined' && !localStorage.getItem(USERS_KEY)) {
    saveUsersToStorage(users);
}
