
'use server';

import { getUserById, createUser, updateUser } from './users-store';
import type { User as FirebaseUser, UserCredential } from 'firebase/auth';
import type { User } from './types';
import { getChannelStats } from './services/youtube-service';

/**
 * Creates or updates a user in the database after successful Firebase authentication.
 */
export async function upsertUser(params: {
    firebaseUser: FirebaseUser, 
    accessToken?: string,
    isNewUser?: boolean
}): Promise<User> {
    const { firebaseUser, accessToken, isNewUser } = params;
    
    // Check if user exists
    const existingUser = await getUserById(firebaseUser.uid);

    if (existingUser) {
        // If user exists, update their info if needed (e.g., new access token)
        const updates: Partial<User> = {};
        if (accessToken) updates.accessToken = accessToken;
        if (Object.keys(updates).length > 0) {
            await updateUser(firebaseUser.uid, updates);
        }
        return { ...existingUser, ...updates };
    }
    
    // For this prototype, all new signups are 'creators'
    const role = 'creator';

    // If new user, create a record in our database
    const newUser: Omit<User, 'joinDate' | 'status' | 'platformsConnected'| 'avatar'> = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        name: firebaseUser.displayName,
        role: role,
        legalFullName: firebaseUser.displayName || ""
    };

    if (accessToken) {
        try {
            const channelInfo = await getChannelStats(accessToken);
            if(channelInfo) {
                (newUser as User).youtubeChannelId = channelInfo.id;
                (newUser as User).platformsConnected = ['youtube'];
            }
        } catch (error) {
            console.error("Could not fetch YouTube channel info on signup:", error);
        }
    }

    const createdUser = await createUser({ ...newUser, image: firebaseUser.photoURL });
    return createdUser;
}
