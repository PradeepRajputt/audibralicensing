
'use server';

import type { User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import clientPromise from './mongodb';
import { Collection, Db } from 'mongodb';

const DB_NAME = "creator_shield_db";
const USERS_COLLECTION = "users";

let db: Db;
let users: Collection<User>;

async function init() {
  if (db && users) return;
  try {
    const client = await clientPromise;
    // The database name should be in the MONGODB_URI.
    // If it's not, client.db() will use the one provided here.
    db = client.db(DB_NAME); 
    users = db.collection<User>(USERS_COLLECTION);
    console.log(`Successfully connected to database "${DB_NAME}" and collection "${USERS_COLLECTION}".`);
  } catch (error) {
    console.error("Database initialization failed:", error);
    // Re-throwing a more specific error to help with debugging.
    throw new Error(`Failed to connect to the database. Please check your MONGODB_URI and network/IP allowlist settings. Original error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Ensure the connection is initialized when the module is first loaded.
(async () => {
  await init();
})();

export async function getAllUsers(): Promise<User[]> {
  noStore();
  if (!users) await init();
  return await users.find({ role: 'creator' }).toArray();
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
