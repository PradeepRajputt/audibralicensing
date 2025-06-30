
'use client';
import type { User } from '@/lib/firebase/types';
import { initialUsers } from '@/lib/users';

const USERS_KEY = 'creator_shield_users';

function getUsersFromStorage(): User[] {
  if (typeof window === 'undefined') return initialUsers;
  
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
  try {
    const parsed = JSON.parse(stored);
    // Basic check to see if it's an array of users
    if (Array.isArray(parsed) && (parsed.length === 0 || 'uid' in parsed[0])) {
        return parsed;
    }
    // If data is corrupt, reset with initial data
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  } catch (e) {
    localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    return initialUsers;
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

// This function should now only be used on the client. 
// Server-side auth will use the server version from /lib/users.
export function getUserByEmail(email: string): User | null {
    const user = getUsersFromStorage().find(u => u.email?.toLowerCase() === email.toLowerCase());
    return user || null;
}

// This function should now only be used on the client. 
// Server-side auth will use the server version from /lib/users.
export async function createUser(userData: Omit<User, 'uid'>) {
    // This is a client-side approximation. The server action handles the real creation.
    console.warn("Client-side createUser called. This should ideally only happen on the server.");
    const allUsers = getUsersFromStorage();
     const newUser: User = {
        ...userData,
        uid: `user_client_${Date.now()}`,
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
