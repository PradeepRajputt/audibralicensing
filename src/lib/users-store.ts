
'use server';

import type { User } from '@/lib/types';
import { addReactivationRequest } from './reactivations-store';
import { unstable_noStore as noStore } from 'next/cache';
import clientPromise from './mongodb';

async function getUsersCollection() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    return db.collection<User>('users');
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
    
    // Logic to handle deactivation and create a reactivation request
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

    const result = await usersCollection.updateOne({ uid }, { $set: { status } });
    
    if (result.matchedCount === 0) {
        // If user doesn't exist, create them with the new status
        const onInsertPayload: Omit<User, 'uid' | 'status' | '_id'> = {
            displayName: 'New User',
            email: `${uid}@example.com`,
            legalFullName: '',
            address: '',
            phone: '',
            passwordHash: '',
            role: 'creator',
            joinDate: new Date().toISOString(),
            platformsConnected: [],
            avatar: '',
            youtubeChannelId: ''
        };
        await usersCollection.insertOne({
            uid,
            status,
            ...onInsertPayload,
        });
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

    // Default values for a user that is created via an update (upsert)
    // for the first time.
    const onInsertPayload: Partial<Omit<User, 'uid' | '_id'>> = {
        legalFullName: '',
        address: '',
        phone: '',
        passwordHash: '', 
        role: 'creator',
        joinDate: new Date().toISOString(),
        status: 'active',
    };
    
    // The email should also only be set on insert. If the user exists, we shouldn't
    // overwrite their email here unless explicitly passed in `updates`.
    if (!updates.email) {
      onInsertPayload.email = `${uid}@example.com`;
    }

    const result = await usersCollection.updateOne(
        { uid },
        {
            $set: updates, 
            $setOnInsert: onInsertPayload
        },
        { upsert: true }
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
