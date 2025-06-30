
'use client';
import { db } from '@/lib/firebase/config';
import type { User } from '@/lib/firebase/types';
import { collection, addDoc, Timestamp } from 'firebase/firestore';


// In a real app, this data would come from Firestore.
// We're using a static array here for demonstration.
// The YouTube Channel IDs are for real, well-known channels for testing.
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
    youtubeChannelId: "invalid-channel-id-for-testing", // This one should fail
    status: "active",
  },
  {
    uid: "admin_user_001",
    displayName: "Admin User",
    email: "admin@creatorshield.com",
    role: "admin",
    joinDate: "2024-01-01",
    avatar: "https://placehold.co/128x128.png",
    platformsConnected: [],
    status: "active",
  }
];

const USERS_KEY = 'creator_shield_users';


function getUsersFromStorage(): User[] {
  if (typeof window === 'undefined') return users; // Return static for SSR
  
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users;
  }
  
  // Quick fix for missing role and status on existing demo data
  let parsedUsers = JSON.parse(stored);
  const needsUpdate = parsedUsers.some((u: User) => !u.role || !u.status);
  if (needsUpdate) {
    parsedUsers = parsedUsers.map((u: User) => ({
      ...u,
      role: u.role || 'creator',
      status: u.status || 'active'
    }));
    localStorage.setItem(USERS_KEY, JSON.stringify(parsedUsers));
  }

  return parsedUsers;
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

export function getUserByEmail(email: string): User | undefined {
    return getUsersFromStorage().find(u => u.email === email);
}

export function updateUserStatus(uid: string, status: 'active' | 'suspended' | 'deactivated') {
    const currentUsers = getUsersFromStorage();
    const updatedUsers = currentUsers.map(user => 
        user.uid === uid ? { ...user, status } : user
    );
    saveUsersToStorage(updatedUsers);
}

export async function addUser(data: Omit<User, 'uid' | 'joinDate' | 'status'>) {
    if (db) {
        await addDoc(collection(db, 'users'), {
            ...data,
            joinDate: Timestamp.now(),
            status: 'active'
        });
    } else {
        // Fallback to localStorage if db is not available
        const currentUsers = getUsersFromStorage();
        const newUser: User = {
            ...data,
            uid: `user_local_${Date.now()}`,
            joinDate: new Date().toISOString(),
            status: 'active',
            avatar: 'https://placehold.co/128x128.png',
            platformsConnected: [],
        };
        saveUsersToStorage([...currentUsers, newUser]);
    }
}
