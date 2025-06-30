
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import type { User } from '@/lib/firebase/types';
import { hashPassword } from '@/lib/auth';
import { Timestamp } from 'firebase-admin/firestore';

export async function getUserByEmail(email: string): Promise<User | null> {
  const { adminDb } = getFirebaseAdmin();
  if (!adminDb) {
    console.error("Firestore is not initialized. Cannot get user by email.");
    return null; 
  }
  const usersCollection = adminDb.collection('users');
  const snapshot = await usersCollection.where('email', '==', email.toLowerCase()).limit(1).get();
  
  if (snapshot.empty) {
    return null;
  }

  const userDoc = snapshot.docs[0];
  const data = userDoc.data();
  
  const joinDate = (data.joinDate as Timestamp)?.toDate().toISOString() ?? new Date().toISOString();

  return { 
    uid: userDoc.id, 
    ...data,
    joinDate,
  } as User;
}

export async function getUserById(uid: string): Promise<User | null> {
    const { adminDb } = getFirebaseAdmin();
    if (!adminDb) {
        console.error("Firestore is not initialized. Cannot get user by ID.");
        return null;
    }
    const doc = await adminDb.collection('users').doc(uid).get();
    if (!doc.exists) {
        return null;
    }
    const data = doc.data()!;
    return {
        uid: doc.id,
        ...data,
        joinDate: (data.joinDate as Timestamp).toDate().toISOString(),
    } as User;
}


export async function createUser(userData: Omit<User, 'uid' | 'passwordHash'> & { password?: string }): Promise<User> {
   const { adminDb } = getFirebaseAdmin();
   if (!adminDb) {
    throw new Error("Server Error: Firestore is not configured. Cannot create user.");
   }
   
   if (!userData.email) {
     throw new Error("Email is required to create a user.");
   }

   const existingUser = await getUserByEmail(userData.email);
   if (existingUser) {
        throw new Error("An account with this email already exists.");
   }

   if (!userData.password) {
        throw new Error("Password is required to create a user.");
   }
   
   const passwordHash = await hashPassword(userData.password);
   
   const docRef = adminDb.collection('users').doc(); 
   
   const newUser: User = {
    ...userData,
    uid: docRef.id,
    passwordHash,
    displayName: userData.displayName || null,
    email: userData.email || null,
    role: userData.role || 'creator',
    joinDate: new Date().toISOString(),
    platformsConnected: userData.platformsConnected || [],
    status: userData.status || 'active',
    avatar: userData.avatar || '',
   };

   const { password, ...dataToStore } = newUser as any;
   
   await docRef.set({
    ...dataToStore,
    joinDate: Timestamp.fromDate(new Date(newUser.joinDate)),
   });

   return newUser;
}

export async function getAllUsers(): Promise<User[]> {
    const { adminDb } = getFirebaseAdmin();
    if (!adminDb) {
        console.error("Firestore is not initialized. Cannot get all users.");
        return [];
    }
    const snapshot = await adminDb.collection('users').get();
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id,
            ...data,
            joinDate: (data.joinDate as Timestamp).toDate().toISOString(),
        } as User;
    });
}

export async function updateUserStatus(uid: string, status: 'active' | 'suspended' | 'deactivated') {
    const { adminDb } = getFirebaseAdmin();
    if (!adminDb) throw new Error("Firestore not configured");
    const userRef = adminDb.collection('users').doc(uid);
    await userRef.update({ status: status });
    console.log(`Updated status for ${uid} to ${status}`);
}
