
'use server';
import type { ReactivationRequest } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import clientPromise from './mongodb';

async function getReactivationsCollection() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    return db.collection<ReactivationRequest>('reactivations');
}


export async function getAllReactivationRequests(): Promise<ReactivationRequest[]> {
    noStore();
    const collection = await getReactivationsCollection();
    const requests = await collection.find({}, { projection: { _id: 0 } }).toArray();
    return requests as ReactivationRequest[];
}

export async function addReactivationRequest(request: Omit<ReactivationRequest, 'requestDate'>): Promise<void> {
    noStore();
    const collection = await getReactivationsCollection();
    const newRequest = {
        ...request,
        requestDate: new Date().toISOString(),
    };
    await collection.updateOne(
      { creatorId: request.creatorId }, 
      { $set: newRequest },
      { upsert: true }
    );
}

export async function removeReactivationRequest(creatorId: string): Promise<void> {
    noStore();
    const collection = await getReactivationsCollection();
    await collection.deleteOne({ creatorId });
}
