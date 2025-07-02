
'use server';

import type { WebScan } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import clientPromise from './mongodb';

async function getWebScansCollection() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    return db.collection<Omit<WebScan, 'id'>>('web_scans');
}


export async function getScansForUser(userId: string): Promise<WebScan[]> {
    noStore();
    const collection = await getWebScansCollection();
    const scans = await collection.find({ userId }, { projection: { _id: 0 } })
                               .sort({ timestamp: -1 })
                               .limit(10)
                               .toArray();
    return scans as WebScan[];
}

export async function addScan(data: Omit<WebScan, 'id' | 'timestamp'>): Promise<WebScan> {
    noStore();
    const collection = await getWebScansCollection();
    const newScan: WebScan = {
        ...data,
        id: `scan_${Date.now()}`,
        timestamp: new Date().toISOString(),
    };
    await collection.insertOne(newScan);
    return newScan;
}
