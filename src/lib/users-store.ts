
'use server';

import type { User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import clientPromise from './mongodb';
import { Collection, Db } from 'mongodb';

let db: Db;
let users: Collection<User>;

async function init() {
  if (db) return;
  try {
    const client = await clientPromise;
    db = client.db();
    users = db.collection<User>('users');
  } catch (error) {
    throw new Error('Failed to connect to the database.');
  }
}

(async () => {
  await init();
})();

export async function getAllUsers(): Promise<User[]> {
  noStore();
  if (!users) await init();
  return await users.find({}).toArray();
}

export async function getUserById(uid: string): Promise<User | null> {
  noStore();
  if (!users) await init();
  return await users.findOne({ uid });
}

export async function getUserByEmail(email: string): Promise<User | null> {
    noStore();
    if (!users) await init();
    return await users.findOne({ email });
}

export async function createUser(data: {
    uid: string;
    email: string;
    displayName: string;
    role: 'creator' | 'admin';
}) {
    noStore();
    if (!users) await init();
    
    const newUser: User = {
        ...data,
        joinDate: new Date().toISOString(),
        status: 'active',
        platformsConnected: [],
        avatar: `https://placehold.co/128x128.png?text=${data.displayName.charAt(0)}`
    }
    
    const result = await users.insertOne(newUser);
    return { ...newUser, _id: result.insertedId };
}

export async function updateUser(uid: string, updates: Partial<Omit<User, 'uid' | '_id'>>): Promise<void> {
    noStore();
    if (!users) await init();
    await users.updateOne({ uid }, { $set: updates });
    console.log(`Updated user ${uid}.`);
}

export async function updateUserStatus(uid: string, status: User['status']): Promise<void> {
    noStore();
    if (!users) await init();
    await users.updateOne({ uid }, { $set: { status } });
}
