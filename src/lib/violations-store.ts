
'use server';
import type { Violation } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import clientPromise from './mongodb';

async function getViolationsCollection() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    return db.collection<Omit<Violation, 'id'>>('violations');
}

export async function createViolation(data: Omit<Violation, 'id' | 'detectedAt' | 'timeline'>): Promise<Violation> {
    noStore();
    const collection = await getViolationsCollection();
    const newViolation: Violation = {
        ...data,
        id: `violation_${Date.now()}`,
        detectedAt: new Date().toISOString(),
        timeline: [{ status: "Detected", date: new Date().toISOString() }],
    };
    await collection.insertOne(newViolation);
    return newViolation;
}

export async function getViolationsForUser(creatorId: string): Promise<Violation[]> {
    noStore();
    const collection = await getViolationsCollection();
    const violations = await collection.find({ creatorId }, { projection: { _id: 0 } }).sort({ detectedAt: -1 }).toArray();
    return violations as Violation[];
}

export async function updateViolationStatus(violationId: string, status: Violation['status']): Promise<void> {
    noStore();
    const collection = await getViolationsCollection();
    const timelineEvent = { 
        status: status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()), 
        date: new Date().toISOString() 
    };

    const result = await collection.updateOne(
        { id: violationId },
        { 
            $set: { status },
            $push: { timeline: timelineEvent }
        }
    );

    if (result.matchedCount === 0) {
        console.error(`Violation with ID ${violationId} not found.`);
        throw new Error("Violation not found and could not be updated.");
    }
}
