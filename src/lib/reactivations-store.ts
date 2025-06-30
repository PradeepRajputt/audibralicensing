
'use client';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Note: In a real application, "reactivation requests" might be a status
// on the user object itself, or a separate collection as modeled here.
// This mock assumes a separate collection.

export type ReactivationRequest = {
  creatorId: string;
  displayName: string;
  email: string;
  avatar: string;
  requestDate: string; // ISO Date string
};

// This function now fetches from Firestore
export async function getAllReactivationRequests(): Promise<ReactivationRequest[]> {
  if (!db) {
    console.warn("Firestore is not initialized. Returning empty array.");
    return [];
  }
  const requestsRef = collection(db, "reactivationRequests");
  const querySnapshot = await getDocs(requestsRef);
  const requests: ReactivationRequest[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    requests.push({
      creatorId: doc.id, // Assuming doc ID is creatorId
      displayName: data.displayName,
      email: data.email,
      avatar: data.avatar,
      requestDate: data.requestDate.toDate().toISOString(),
    });
  });
  return requests;
}

// This would be handled by a server action that updates the user's status
// and then deletes the reactivation request document.
export async function approveReactivationRequest(creatorId: string) {
    if (!db) return;
    await deleteDoc(doc(db, "reactivationRequests", creatorId));
    // The server action would also set user status to 'active'
}

export async function denyReactivationRequest(creatorId: string) {
    if (!db) return;
    await deleteDoc(doc(db, "reactivationRequests", creatorId));
}
