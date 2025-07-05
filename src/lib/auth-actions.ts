
'use server';

import { getUserByEmail, getUserById, createUser } from './users-store';
import type { User } from './types';

export async function upsertUser(
    userData: { id: string; email: string | null; displayName: string | null; avatar: string | null }
): Promise<User | null> {
    if (!userData.email) {
        console.error("No email provided for upsert.");
        return null;
    }

    try {
        // Try to find user by email first, as this is more reliable across providers
        let dbUser = await getUserByEmail(userData.email);

        if (dbUser) {
            // User exists, maybe update their details
            // For now, we just return the existing user
            return dbUser;
        }

        // If no user found by email, try by ID (Firebase UID)
        dbUser = await getUserById(userData.id);
        
        if (dbUser) {
            return dbUser;
        }

        // If user doesn't exist at all, create them
        const userRole = userData.email === 'admin@creatorshield.com' ? 'admin' : 'creator';

        const newUser = await createUser({
            id: userData.id,
            name: userData.displayName,
            displayName: userData.displayName,
            email: userData.email,
            image: userData.avatar,
            role: userRole,
        });

        return newUser;

    } catch (error) {
        console.error("Error in upsertUser:", error);
        return null;
    }
}
