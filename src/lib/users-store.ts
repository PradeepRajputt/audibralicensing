
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
 * Creates a new user in the database.
 */
export async function createUser(data: Omit<User, 'uid' | '_id' | 'passwordHash'>): Promise<User> {
    noStore();
    const collection = await getUsersCollection();
    const uid = `user_${Date.now()}`;
    // This is a placeholder as password handling is removed
    const newUser: User = { ...data, uid, passwordHash: 'placeholder' }; 
    
    await collection.insertOne({ ...newUser });
    return newUser;
}

/**
 * Retrieves a single user document by its email from the database.
 */
export async function getUserByEmail(email: string): Promise<User | undefined> {
  noStore();
  const usersCollection = await getUsersCollection();
  const user = await usersCollection.findOne({ email }, { projection: { _id: 0 } });
  return user as User | undefined;
}

/**
 * Retrieves all user documents from the database.
 * @returns A promise that resolves to an array of User objects.
 */
export async function getAllUsers(): Promise<User[]> {
  noStore();
  const usersCollection = await getUsersCollection();
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

    const onInsertPayload = {
      displayName: 'New User',
      email: `${uid}@example.com`,
      phone: '',
      legalFullName: '',
      address: '',
      passwordHash: '',
      role: 'creator' as const,
      joinDate: new Date().toISOString(),
      platformsConnected: [],
      avatar: '',
      youtubeChannelId: ''
    };

    const result = await usersCollection.updateOne(
      { uid },
      { 
        $set: { status },
        $setOnInsert: onInsertPayload
      },
      { upsert: true }
    );
     if (result.modifiedCount === 0 && result.upsertedCount === 0) {
        console.log(`No status change needed for user ${uid}.`);
    }
}


/**
 * Updates a user's profile details. If the user doesn't exist, it will be created.
 * @param uid The ID of the user to update.
 * @param updates The partial user data to update.
 */
export async function updateUser(uid: string, updates: Partial<Omit<User, 'uid' | '_id'>>): Promise<void> {
    noStore();
    const usersCollection = await getUsersCollection();

    const onInsertPayload: Omit<User, 'uid' | '_id'> = {
        displayName: 'New User',
        email: `${uid}@example.com`,
        phone: '',
        legalFullName: '',
        address: '',
        passwordHash: '', 
        role: 'creator',
        joinDate: new Date().toISOString(),
        status: 'active',
        platformsConnected: [],
        avatar: 'https://placehold.co/128x128.png',
    };
    
    const updatePayload = { ...updates };
    const insertPayload = { ...onInsertPayload, ...updates };

    await usersCollection.updateOne(
        { uid },
        {
            $set: updatePayload, 
            $setOnInsert: insertPayload
        },
        { upsert: true }
    );
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
