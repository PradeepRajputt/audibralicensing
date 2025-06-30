
'use client';
import type { User } from '@/lib/firebase/types';

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
  return JSON.parse(stored);
}

function saveUsersToStorage(users: User[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  window.dispatchEvent(new Event('storage'));
}

export function getAllUsers(): User[] {
    return getUsersFromStorage();
}

export function getUserById(uid: string): User | undefined {
    return getUsersFromStorage().find(u => u.uid === uid);
}

export function updateUserStatus(uid: string, status: 'active' | 'suspended' | 'deactivated') {
    const currentUsers = getUsersFromStorage();
    const updatedUsers = currentUsers.map(user => 
        user.uid === uid ? { ...user, status } : user
    );
    saveUsersToStorage(updatedUsers);
}
