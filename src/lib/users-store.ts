
'use server';

import type { User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import clientPromise from './mongodb';
import { Collection, Db } from 'mongodb';

const DB_NAME = "creator_shield_db";
const USERS_COLLECTION = "users";

async function getUsersCollection(): Promise<Collection<User>> {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    return db.collection<User>(USERS_COLLECTION);
}

export async function getAllUsers(): Promise<User[]> {
  noStore();
  const users = await getUsersCollection();
  return await users.find({ role: 'creator' }).sort({ joinDate: -1 }).toArray();
}

export async function getUserById(uid: string): Promise<User | null> {
  noStore();
  const users = await getUsersCollection();
  return await users.findOne({ uid });
}

export async function getUserByEmail(email: string): Promise<User | null> {
    noStore();
    const users = await getUsersCollection();
    return await users.findOne({ email });
}

export async function createUser(data: {
    uid: string;
    email: string;
    displayName: string;
    role: 'creator' | 'admin';
}) {
    noStore();
    const users = await getUsersCollection();
    
    const newUser: User = {
        ...data,
        joinDate: new Date().toISOString(),
        status: 'active',
        platformsConnected: [],
        avatar: `https://placehold.co/128x128.png?text=${data.displayName.charAt(0)}`
    }
    
    const result = await users.insertOne(newUser);
    if (!result.insertedId) {
        throw new Error("Failed to create user.");
    }
    return { ...newUser, _id: result.insertedId };
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
