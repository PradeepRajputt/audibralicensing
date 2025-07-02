
'use server';
import type { ProtectedContent } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import clientPromise from './mongodb';

async function getContentCollection() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    return db.collection<ProtectedContent>('content');
}

export async function getAllContentForUser(userId: string): Promise<ProtectedContent[]> {
    noStore();
    const collection = await getContentCollection();
    const content = await collection.find({ creatorId: userId }, { projection: { _id: 0 } }).sort({ uploadDate: -1 }).toArray();
    return content as ProtectedContent[];
}

export async function getContentById(contentId: string): Promise<ProtectedContent | undefined> {
    noStore();
    const collection = await getContentCollection();
    const content = await collection.findOne({ id: contentId }, { projection: { _id: 0 } });
    return content as ProtectedContent | undefined;
}

export async function createContent(data: Omit<ProtectedContent, 'id' | 'uploadDate' | 'status' | 'lastChecked'>): Promise<ProtectedContent> {
    noStore();
    const collection = await getContentCollection();
    const newContent: ProtectedContent = {
        ...data,
        id: `content_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        uploadDate: new Date().toISOString(),
        status: 'active',
        lastChecked: new Date().toISOString()
    };
    await collection.insertOne(newContent);
    return newContent;
}

export async function deleteContentById(contentId: string): Promise<void> {
    noStore();
    const collection = await getContentCollection();
    const result = await collection.deleteOne({ id: contentId });
    if (result.deletedCount === 0) {
        throw new Error("Content not found.");
    }
}

export async function updateContentTags(contentId: string, tags: string[]): Promise<ProtectedContent> {
    noStore();
    const collection = await getContentCollection();
    const result = await collection.findOneAndUpdate(
        { id: contentId },
        { $set: { tags } },
        { returnDocument: 'after', projection: { _id: 0 } }
    );
    if (!result) {
        throw new Error("Content not found.");
    }
    return result as ProtectedContent;
}

export async function requestRescan(contentId: string): Promise<ProtectedContent> {
    noStore();
    const collection = await getContentCollection();
    const result = await collection.findOneAndUpdate(
        { id: contentId },
        { $set: { lastChecked: new Date().toISOString() } },
        { returnDocument: 'after', projection: { _id: 0 } }
    );
    if (!result) {
        throw new Error("Content not found.");
    }
    return result as ProtectedContent;
}
