
import { adminDb } from '@/lib/firebase/admin';
import type { User } from '@/lib/firebase/types';
import { Timestamp } from 'firebase-admin/firestore';


export async function getUserByEmail(email: string): Promise<User | null> {
  if (!adminDb) {
      throw new Error("Firestore is not initialized. Check Firebase Admin credentials.");
  }
  const usersCollection = adminDb.collection('users');
  const snapshot = await usersCollection.where('email', '==', email).limit(1).get();
  if (snapshot.empty) {
    return null;
  }
  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();
  
  // Convert Firestore Timestamps to ISO strings for serializability
  const joinDate = (userData.joinDate as Timestamp)?.toDate().toISOString() ?? new Date().toISOString();

  return { 
    uid: userDoc.id, 
    ...userData,
    joinDate,
  } as User;
}

export async function createUser(userData: Omit<User, 'uid'>): Promise<string> {
   if (!adminDb) {
       throw new Error("Firestore is not initialized. Cannot create user.");
   }
   const usersCollection = adminDb.collection('users');
   const { joinDate, ...rest } = userData;
   const docRef = usersCollection.doc(); // Let Firestore generate the ID
   await docRef.set({
    ...rest,
    joinDate: Timestamp.fromDate(new Date(joinDate)), // Store as Timestamp
   });
   return docRef.id;
}
