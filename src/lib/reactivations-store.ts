
'use server';
import type { ReactivationRequest } from '@/lib/types';
import clientPromise from '@/lib/mongodb';

async function getDb() {
  const client = await clientPromise;
  return client.db("creator-shield-db");
}

export async function getAllReactivationRequests(): Promise<ReactivationRequest[]> {
    const db = await getDb();
    const requests = await db.collection('reactivationRequests').find({}).sort({ requestDate: -1 }).toArray();
    // Assuming creatorId is a string, no need for ObjectId mapping if it's not the primary _id
    return requests as unknown as ReactivationRequest[];
}

export async function addReactivationRequest(request: Omit<ReactivationRequest, 'requestDate'>): Promise<void> {
    const db = await getDb();
    // Use upsert to avoid duplicate requests for the same user
    await db.collection('reactivationRequests').updateOne(
        { creatorId: request.creatorId },
        { $set: { ...request, requestDate: new Date().toISOString() } },
        { upsert: true }
    );
}

export async function removeReactivationRequest(creatorId: string): Promise<void> {
    const db = await getDb();
    await db.collection('reactivationRequests').deleteOne({ creatorId });
}
