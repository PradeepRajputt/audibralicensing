
'use server';

import type { User } from '@/lib/types';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function getDb() {
  const client = await clientPromise;
  return client.db("creator-shield-db");
}

/**
 * Retrieves all user documents from the 'users' collection in MongoDB.
 * @returns A promise that resolves to an array of User objects.
 */
export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  const usersCollection = db.collection('users');
  const users = await usersCollection.find({}).sort({ joinDate: -1 }).toArray();
  
  return users.map(user => {
    const { _id, ...rest } = user;
    return { ...rest, uid: _id.toString() } as User;
  });
}

/**
 * Retrieves a single user document by its UID from MongoDB.
 * @param uid The user's unique ID.
 * @returns A promise that resolves to the User object or undefined if not found.
 */
export async function getUserById(uid: string): Promise<User | undefined> {
  if (!ObjectId.isValid(uid)) return undefined;
  const db = await getDb();
  const user = await db.collection('users').findOne({ _id: new ObjectId(uid) });
  if (!user) return undefined;
  
  const { _id, ...rest } = user;
  return { ...rest, uid: _id.toString() } as User;
}

/**
 * Retrieves a single user document by their email from MongoDB.
 * @param email The user's email address.
 * @returns A promise that resolves to the User object or undefined if not found.
 */
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ email: email.toLowerCase() });
   if (!user) return undefined;
  
  const { _id, ...rest } = user;
  return { ...rest, uid: _id.toString() } as User;
}

/**
 * Updates a user's status in MongoDB.
 * @param uid The ID of the user to update.
 * @param status The new status for the user.
 */
export async function updateUserStatus(uid: string, status: 'active' | 'suspended' | 'deactivated'): Promise<void> {
    if (!ObjectId.isValid(uid)) return;
    const db = await getDb();
    await db.collection('users').updateOne({ _id: new ObjectId(uid) }, { $set: { status } });
    console.log(`Updated status for user ${uid} to ${status}`);
}
