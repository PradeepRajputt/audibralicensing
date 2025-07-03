
'use server';

import { getUserById as fetchUser } from '@/lib/users-store';
import type { User } from '@/lib/types';

/**
 * A dedicated Server Action for client components to securely fetch user data.
 * This function isolates server-side logic from the client-side bundle.
 * @param uid The user's unique ID.
 * @returns A promise that resolves to the user object or null.
 */
export async function getAppUser(uid: string): Promise<User | null> {
    if (!uid) return null;
    try {
        const user = await fetchUser(uid);
        return user ?? null;
    } catch(error) {
        console.error("Failed to fetch app user:", error);
        return null;
    }
}
