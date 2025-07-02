
'use server';

import type { User } from '@/lib/types';
import { addReactivationRequest } from './reactivations-store';
import { unstable_noStore as noStore } from 'next/cache';
import clientPromise from './mongodb';

async function getUsersCollection() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    return db.collection<Omit<User, 'uid'>>('users');
}


/**
 * Retrieves all user documents from the database.
 * @returns A promise that resolves to an array of User objects.
 */
export async function getAllUsers(): Promise<User[]> {
  noStore();
  const usersCollection = await getUsersCollection();
  // Using find with empty filter to get all documents
  // Excluding the _id field from the result set
  const users = await usersCollection.find({}, { projection: { _id: 0 } }).sort({ joinDate: -1 }).toArray();
  return users as User[];
}

/**
 * Retrieves a single user document by its UID from the database.
 * @param uid The user's unique ID.
 * @returns A promise that resolves to the User object or undefined if not found.
 */
export async function getUserById(uid: string): Promise<User | undefined> {
  noStore();
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ uid: uid }, { projection: { _id: 0 } });
  return user as User | undefined;
}

/**
 * Updates a user's status in the database.
 * @param uid The ID of the user to update.
 * @param status The new status for the user.
 */
export async function updateUserStatus(uid: string, status: 'active' | 'suspended' | 'deactivated'): Promise<void> {
    noStore();
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne({ uid }, { $set: { status } });
    
    if (result.matchedCount === 0) {
        throw new Error('User not found.');
    }
    
    if (status === 'deactivated') {
        const user = await getUserById(uid);
        if (user) {
            await addReactivationRequest({
                creatorId: user.uid,
                displayName: user.displayName || 'Unknown',
                email: user.email || 'no-email@provided.com',
                avatar: user.avatar,
            });
        }
    }
}

/**
 * Updates a user's profile details. If the user doesn't exist, it will be created.
 * @param uid The ID of the user to update.
 * @param updates The partial user data to update.
 */
export async function updateUser(uid: string, updates: Partial<User>): Promise<void> {
    noStore();
    const usersCollection = await getUsersCollection();

    // The fields to set if the document is created (upserted).
    // These are the fields that every user should have.
    const onInsertPayload: Omit<User, 'uid' | 'displayName' | 'avatar'> = {
        joinDate: new Date().toISOString(),
        role: 'creator',
        status: 'active',
        email: `${uid}@example.com`, // Placeholder, as we don't have it from this flow
        passwordHash: '', // Not used
        platformsConnected: [],
    };

    const result = await usersCollection.updateOne(
        { uid },
        {
            $set: updates, // Apply specified updates regardless
            $setOnInsert: onInsertPayload // Apply these only if a new document is created
        },
        { upsert: true } // This will create the document if it doesn't exist
    );

    if (result.modifiedCount === 0 && result.upsertedCount === 0) {
        console.log(`No changes needed for user ${uid}.`);
    }
}


/**
 * Removes the YouTube channel connection from a user.
 */
export async function disconnectYoutubeChannel(uid: string): Promise<void> {
    noStore();
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
        { uid },
        { 
            $unset: { youtubeChannelId: "" },
            $pull: { platformsConnected: 'youtube' }
        }
    );
     if (result.matchedCount === 0) {
        throw new Error("User not found for disconnect.");
    }
}
