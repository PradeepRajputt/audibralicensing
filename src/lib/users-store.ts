
'use server';

import type { User } from '@/lib/types';
import { hashPassword, verifyPassword as verify } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function getDb() {
  const client = await clientPromise;
  return client.db();
}

/**
 * Retrieves all user documents from the 'users' collection in MongoDB.
 * @returns A promise that resolves to an array of User objects.
 */
export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  const users = await db.collection<Omit<User, 'uid'>>('users').find({}).sort({ joinDate: -1 }).toArray();
  return users.map(user => ({ ...user, uid: user._id.toString() })) as User[];
}

/**
 * Retrieves a single user document by its UID from MongoDB.
 * @param uid The user's unique ID.
 * @returns A promise that resolves to the User object or undefined if not found.
 */
export async function getUserById(uid: string): Promise<User | undefined> {
  if (!ObjectId.isValid(uid)) return undefined;
  const db = await getDb();
  const user = await db.collection<Omit<User, 'uid'>>('users').findOne({ _id: new ObjectId(uid) });
  if (!user) return undefined;
  return { ...user, uid: user._id.toString() } as User;
}

/**
 * Retrieves a single user document by their email from MongoDB.
 * @param email The user's email address.
 * @returns A promise that resolves to the User object or undefined if not found.
 */
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  const user = await db.collection<Omit<User, 'uid'>>('users').findOne({ email: email.toLowerCase() });
   if (!user) return undefined;
  return { ...user, uid: user._id.toString() } as User;
}

/**
 * Creates a new user in MongoDB.
 * @param userData - The data for the new user, including a plain-text password.
 * @returns A promise that resolves to the newly created User object.
 */
export async function createUser(userData: Omit<User, 'uid' | 'passwordHash' | 'joinDate' | 'status' | 'platformsConnected' | 'avatar'> & { password: string }): Promise<User> {
  const db = await getDb();
  
  if (!userData.email || !userData.password) {
      throw new Error("Email and password are required.");
  }

  const existingUser = await getUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }
  
  const passwordHash = await hashPassword(userData.password);
  
  const newUser: Omit<User, 'uid'> = {
    displayName: userData.displayName || null,
    email: userData.email.toLowerCase(),
    passwordHash: passwordHash,
    role: userData.role || 'creator',
    joinDate: new Date().toISOString(),
    platformsConnected: [],
    status: 'active',
    avatar: `https://placehold.co/128x128.png`,
    youtubeChannelId: userData.youtubeChannelId,
  };

  const result = await db.collection('users').insertOne(newUser);
  if (!result.insertedId) throw new Error("Failed to create user in database.");

  return { ...newUser, uid: result.insertedId.toString() };
}

/**
 * Verifies a user's password.
 * @param password The plain-text password.
 * @param hash The stored password hash from the database.
 * @returns A promise resolving to true if the password is valid, false otherwise.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return verify(password, hash);
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
