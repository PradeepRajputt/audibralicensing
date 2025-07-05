
'use server';

import { getUserByEmail, getUserById, createUser, updateUser } from './users-store';
import type { User } from './types';
import { getChannelStats } from './services/youtube-service';

export async function upsertUser(
    userData: { id: string; email: string | null; displayName: string | null; avatar: string | null; accessToken?: string; }
): Promise<User | null> {
    if (!userData.email) {
        console.error("No email provided for upsert.");
        return null;
    }

    try {
        let dbUser = await getUserByEmail(userData.email);

        if (dbUser) {
            // User exists, update avatar, name, and access token if they changed
            const updates: Partial<User> = {};
            if (userData.displayName && userData.displayName !== dbUser.displayName) {
                updates.displayName = userData.displayName;
            }
            if (userData.avatar && userData.avatar !== dbUser.avatar) {
                updates.avatar = userData.avatar;
            }
             if (userData.accessToken) {
                updates.accessToken = userData.accessToken;
            }

            if (Object.keys(updates).length > 0) {
                await updateUser(dbUser.id, updates);
                dbUser = { ...dbUser, ...updates };
            }
            return dbUser;
        }

        // If user doesn't exist at all, create them
        const userRole = userData.email === 'admin@creatorshield.com' ? 'admin' : 'creator';

        const newUser: User = {
            id: userData.id,
            uid: userData.id,
            displayName: userData.displayName,
            email: userData.email,
            avatar: userData.avatar,
            role: userRole,
            joinDate: new Date().toISOString(),
            status: 'active',
            platformsConnected: [],
            accessToken: userData.accessToken,
        };

        const createdUser = await createUser(newUser);

        return createdUser;

    } catch (error) {
        console.error("Error in upsertUser:", error);
        return null;
    }
}
