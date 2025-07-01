
'use server';

import type { User } from '@/lib/firebase/types';
import { getFirebaseAdmin } from './firebase/admin';
import { hashPassword, verifyPassword as verify } from '@/lib/auth';

/**
 * Retrieves all user documents from the 'users' collection in Firestore.
 * @returns A promise that resolves to an array of User objects.
 */
export async function getAllUsers(): Promise<User[]> {
  const { adminDb } = getFirebaseAdmin();
  if (!adminDb) {
    console.error("Firestore not initialized for getAllUsers");
    return [];
  }
  const usersSnapshot = await adminDb.collection('users').get();
  const users: User[] = [];
  usersSnapshot.forEach(doc => {
    users.push({ uid: doc.id, ...doc.data() } as User);
  });
  return users.sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime());
}

/**
 * Retrieves a single user document by its UID from Firestore.
 * @param uid The user's unique ID.
 * @returns A promise that resolves to the User object or undefined if not found.
 */
export async function getUserById(uid: string): Promise<User | undefined> {
  const { adminDb } = getFirebaseAdmin();
  if (!adminDb) return undefined;
  const userDoc = await adminDb.collection('users').doc(uid).get();
  if (!userDoc.exists) {
    return undefined;
  }
  return { uid: userDoc.id, ...userDoc.data() } as User;
}

/**
 * Retrieves a single user document by their email from Firestore.
 * @param email The user's email address.
 * @returns A promise that resolves to the User object or undefined if not found.
 */
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const { adminDb } = getFirebaseAdmin();
  if (!adminDb) return undefined;
  const q = adminDb.collection('users').where('email', '==', email.toLowerCase()).limit(1);
  const querySnapshot = await q.get();
  if (querySnapshot.empty) {
    return undefined;
  }
  const userDoc = querySnapshot.docs[0];
  return { uid: userDoc.id, ...userDoc.data() } as User;
}

/**
 * Creates a new user in Firebase Authentication and Firestore.
 * @param userData - The data for the new user, including a plain-text password.
 * @returns A promise that resolves to the newly created User object.
 * @throws Will throw an error if Firebase is not initialized, email exists, or user creation fails.
 */
export async function createUser(userData: Omit<User, 'uid' | 'passwordHash'> & { password: string }): Promise<User> {
  const { auth, db } = getFirebaseAdmin();
  if (!auth || !db) {
    throw new Error('Firebase Admin not initialized. Cannot create user.');
  }

  const { email, password, displayName, role } = userData;
  
  if (!email || !password) {
      throw new Error("Email and password are required to create a user.");
  }

  const existingUserByEmail = await getUserByEmail(email);
  if (existingUserByEmail) {
    throw new Error("An account with this email already exists.");
  }
  
  const passwordHash = await hashPassword(password);
  
  // Create user in Firebase Authentication
  const userRecord = await auth.createUser({
      email: email,
      emailVerified: true, // Or false, depending on your flow
      password: password,
      displayName: displayName ?? undefined,
      disabled: false,
  });

  // Create user document in Firestore
  const newUser: Omit<User, 'uid'> = {
    displayName: userRecord.displayName || null,
    email: userRecord.email!,
    passwordHash: passwordHash,
    role: role || 'creator',
    joinDate: new Date().toISOString(),
    platformsConnected: userData.platformsConnected || [],
    status: userData.status || 'active',
    avatar: userData.avatar || `https://placehold.co/128x128.png`,
    youtubeChannelId: userData.youtubeChannelId,
  };

  await db.collection('users').doc(userRecord.uid).set(newUser);
  
  const finalUser = await getUserById(userRecord.uid);
  if (!finalUser) throw new Error("Failed to retrieve created user from Firestore.");

  return finalUser;
}

/**
 * Verifies a user's password.
 * @param password The plain-text password.
 * @param hash The stored password hash from Firestore.
 * @returns A promise resolving to true if the password is valid, false otherwise.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return verify(password, hash);
}

/**
 * Updates a user's status in Firestore.
 * @param uid The ID of the user to update.
 * @param status The new status for the user.
 */
export async function updateUserStatus(uid: string, status: 'active' | 'suspended' | 'deactivated'): Promise<void> {
    const { adminDb } = getFirebaseAdmin();
    if (!adminDb) {
        throw new Error("Firebase not initialized. Cannot update user status.");
    }
    const userRef = adminDb.collection('users').doc(uid);
    await userRef.update({ status });
    console.log(`Updated status for user ${uid} to ${status}`);
}
