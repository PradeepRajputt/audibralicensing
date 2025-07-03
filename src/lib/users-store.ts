
'use server';

import type { User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import clientPromise from './mongodb';
import { Collection, ObjectId } from 'mongodb';
import { randomUUID } from 'crypto';


const DB_NAME = "creator_shield_db";
const USERS_COLLECTION = "users";

async function getUsersCollection(): Promise<Collection<User>> {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    return db.collection<User>(USERS_COLLECTION);
}

// Helper to sanitize MongoDB documents to plain objects to prevent serialization errors
// when passing data from Server Components to Client Components.
const sanitizeUser = (user: any): User | null => {
  if (!user) return null;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const { _id, passwordHash, ...rest } = user as any; // Explicitly remove passwordHash
  return {
    ...rest,
    uid: rest.uid.toString(), // Ensure uid is a string
  };
};


export async function getAllUsers(): Promise<User[]> {
  noStore();
  const usersCollection = await getUsersCollection();
  const usersArray = await usersCollection.find({ role: 'creator' }).sort({ joinDate: -1 }).toArray();
  return usersArray.map(user => sanitizeUser(user)!);
}

export async function getUserById(uid: string): Promise<User | null> {
  noStore();
  if (!uid) return null;
  const users = await getUsersCollection();
  const user = await users.findOne({ uid });
  // This function is used by client pages, so we sanitize
  return sanitizeUser(user);
}

export async function getUserByEmail(email: string): Promise<(User & { _id?: ObjectId}) | null> {
    noStore();
    if (!email) return null;
    const users = await getUsersCollection();
    const user = await users.findOne({ email });
    // This function is used by the auth system server-side, so we return the raw object with passwordHash
    return user;
}

export async function createUser(data: {
    email: string;
    displayName: string;
    role: 'creator' | 'admin';
    passwordHash: string; // This is a security risk for prototype only.
}) {
    noStore();
    const users = await getUsersCollection();
    
    const newUser: Omit<User, '_id'> = {
        uid: randomUUID(),
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        passwordHash: data.passwordHash,
        joinDate: new Date().toISOString(),
        status: 'active',
        platformsConnected: [],
        avatar: `https://placehold.co/128x128.png?text=${data.displayName.charAt(0)}`
    }
    
    const result = await users.insertOne(newUser as User);
    if (!result.insertedId) {
        throw new Error("Failed to create user.");
    }

    const createdUser = await users.findOne({ uid: newUser.uid });
    return sanitizeUser(createdUser);
}

export async function updateUser(uid: string, updates: Partial<Omit<User, 'uid' | '_id'>>): Promise<void> {
    noStore();
    const users = await getUsersCollection();
    const result = await users.updateOne({ uid }, { $set: updates });
    if (result.matchedCount === 0) {
        console.warn(`Attempted to update non-existent user with UID: ${uid}`);
    }
    console.log(`Updated user ${uid}.`);
}

export async function updateUserStatus(uid: string, status: User['status']): Promise<void> {
    noStore();
    const users = await getUsersCollection();
    await users.updateOne({ uid }, { $set: { status } });
}
