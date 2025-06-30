
import { getFirebaseAdmin } from '@/lib/firebase/admin';
import type { User } from '@/lib/firebase/types';
import { hashPassword } from '@/lib/auth';
import { Timestamp } from 'firebase-admin/firestore';

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { adminDb } = getFirebaseAdmin();
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
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    // In a real production app, you might want to rethrow or handle this more gracefully.
    throw new Error("A database error occurred while fetching the user.");
  }
}

export async function getUserById(uid: string): Promise<User | null> {
    try {
        const { adminDb } = getFirebaseAdmin();
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
    } catch (error) {
        console.error("Error in getUserById:", error);
        throw new Error("A database error occurred while fetching the user.");
    }
}

export async function createUser(userData: Omit<User, 'uid' | 'passwordHash'> & { password?: string }): Promise<User> {
   try {
    const { adminDb } = getFirebaseAdmin();
   
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
      email: userData.email,
      role: userData.role || 'creator',
      joinDate: new Date().toISOString(),
      platformsConnected: userData.platformsConnected || [],
      status: userData.status || 'active',
      avatar: userData.avatar || `https://placehold.co/128x128.png`,
    };

    const { password, ...dataToStore } = newUser as any;
    
    await docRef.set({
      ...dataToStore,
      joinDate: Timestamp.fromDate(new Date(newUser.joinDate)),
    });

    return newUser;
   } catch(error) {
        console.error("Error in createUser:", error);
        if (error instanceof Error && (error.message.includes("already exists") || error.message.includes("database error"))) {
          throw error;
        }
        throw new Error("An unexpected error occurred during user creation.");
   }
}

export async function getAllUsers(): Promise<User[]> {
    try {
        const { adminDb } = getFirebaseAdmin();
        const snapshot = await adminDb.collection('users').orderBy('joinDate', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                uid: doc.id,
                ...data,
                joinDate: (data.joinDate as Timestamp).toDate().toISOString(),
            } as User;
        });
    } catch (error) {
        console.error("Error fetching all users:", error);
        throw new Error("Could not fetch user list from the database.");
    }
}

export async function updateUserStatus(uid: string, status: 'active' | 'suspended' | 'deactivated') {
    try {
        const { adminDb } = getFirebaseAdmin();
        const userRef = adminDb.collection('users').doc(uid);
        await userRef.update({ status: status });
        console.log(`Updated status for ${uid} to ${status}`);
    } catch (error) {
        console.error(`Failed to update status for user ${uid}:`, error);
        throw new Error("Could not update user status in the database.");
    }
}
