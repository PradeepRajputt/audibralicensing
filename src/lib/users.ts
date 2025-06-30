
import type { User } from '@/lib/firebase/types';
import { hashPassword } from '@/lib/auth';

// This is the in-memory "database" for the server.
// It starts with some mock data.
const users: User[] = [
  {
    uid: "user_creator_123",
    displayName: "Sample Creator",
    email: "creator@example.com",
    role: "creator",
    joinDate: new Date("2024-01-15").toISOString(),
    avatar: "https://placehold.co/128x128.png",
    platformsConnected: ["youtube", "web"],
    youtubeChannelId: "UC-lHJZR3Gqxm24_Vd_AJ5Yw",
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

export function getAllUsers(): User[] {
    return users;
}

export function getUserById(uid: string): User | undefined {
    return users.find(u => u.uid === uid);
}

export function getUserByEmail(email: string): User | null {
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    return user || null;
}

export async function createUser(userData: Omit<User, 'uid' | 'passwordHash'> & { password?: string }): Promise<User> {
    if (getUserByEmail(userData.email!)) {
        throw new Error("An account with this email already exists.");
    }
    const passwordHash = userData.password ? await hashPassword(userData.password) : undefined;
    
    const newUser: User = {
        ...userData,
        uid: `user_${Date.now()}`,
        passwordHash,
    };
    
    users.push(newUser);
    return newUser;
}

export function updateUserStatus(uid: string, status: 'active' | 'suspended' | 'deactivated') {
    const userIndex = users.findIndex(u => u.uid === uid);
    if (userIndex > -1) {
        users[userIndex].status = status;
    }
}

// Export the initial data for the client-side store to use.
export const initialUsers = users;
