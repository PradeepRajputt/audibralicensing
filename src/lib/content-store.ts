
'use server';
import type { ProtectedContent } from '@/lib/types';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function getDb() {
  const client = await clientPromise;
  return client.db("creator-shield-db");
}

export async function getAllContentForUser(userId: string): Promise<ProtectedContent[]> {
    const db = await getDb();
    const contentCollection = db.collection('protectedContent');
    const content = await contentCollection
      .find({ creatorId: userId })
      .sort({ uploadDate: -1 })
      .toArray();
    
    return content.map(c => {
        const { _id, ...rest } = c;
        return { ...rest, id: _id.toString() } as unknown as ProtectedContent
    });
}

export async function createContent(data: Omit<ProtectedContent, 'id' | 'uploadDate'>): Promise<void> {
    const db = await getDb();
    const newContent = {
        ...data,
        uploadDate: new Date().toISOString(),
    };
    await db.collection('protectedContent').insertOne(newContent);
}
