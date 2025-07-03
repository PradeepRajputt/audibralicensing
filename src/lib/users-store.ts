
'use server';

import type { User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { admin } from './firebase-admin';

const db = admin.firestore();
const usersCollection = db.collection('users');

export async function getAllUsers(): Promise<User[]> {
  noStore();
  const snapshot = await usersCollection.get();
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => doc.data() as User);
}

export async function getUserById(uid: string): Promise<User | undefined> {
  noStore();
  const doc = await usersCollection.doc(uid).get();
  return doc.exists ? (doc.data() as User) : undefined;
}

export async function createUserInFirestore(data: {
    uid: string;
    email: string;
    displayName: string;
    role: 'creator' | 'admin';
}) {
    const newUser: User = {
        ...data,
        joinDate: new Date().toISOString(),
        status: 'active',
        platformsConnected: [],
        avatar: `https://placehold.co/128x128.png?text=${data.displayName.charAt(0)}`
    }
    await usersCollection.doc(data.uid).set(newUser);
    return newUser;
}

export async function updateUser(uid: string, updates: Partial<Omit<User, 'uid'>>): Promise<void> {
    noStore();
    await usersCollection.doc(uid).update(updates);
}

export async function updateUserStatus(uid: string, status: User['status']): Promise<void> {
    noStore();
    await usersCollection.doc(uid).update({ status });
}

export async function disconnectYoutubeChannel(userId: string): Promise<void> {
    noStore();
    const user = await getUserById(userId);
    if (user) {
        await usersCollection.doc(userId).update({
            youtubeChannelId: admin.firestore.FieldValue.delete(),
            platformsConnected: admin.firestore.FieldValue.arrayRemove('youtube')
        });
    }
}
