
'use server';
import type { ProtectedContent } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

// In-memory array to store protected content
let protectedContent: ProtectedContent[] = [
    {
        id: 'content_1',
        creatorId: 'user_creator_123',
        title: 'My Most Epic Adventure Yet!',
        contentType: 'video',
        platform: 'youtube',
        videoURL: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        tags: ['travel', 'adventure', 'filmmaking'],
        uploadDate: new Date('2024-05-15T10:00:00Z').toISOString(),
    },
    {
        id: 'content_2',
        creatorId: 'user_creator_123',
        title: 'How to Bake the Perfect Sourdough',
        contentType: 'video',
        platform: 'youtube',
        videoURL: 'https://youtube.com/watch?v=some_other_id',
        tags: ['baking', 'cooking', 'sourdough'],
        uploadDate: new Date('2024-04-22T14:30:00Z').toISOString(),
    },
     {
        id: 'content_3',
        creatorId: 'user_creator_123',
        title: 'My Travel Blog - Summer in Italy',
        contentType: 'text',
        platform: 'web',
        videoURL: 'https://myblog.com/italy-summer',
        tags: ['travel', 'blog', 'italy'],
        uploadDate: new Date('2024-03-10T09:00:00Z').toISOString(),
    },
     {
        id: 'content_4',
        creatorId: 'user_creator_123',
        title: 'Acoustic Guitar Session',
        contentType: 'audio',
        platform: 'vimeo',
        videoURL: 'https://vimeo.com/12345678',
        tags: ['music', 'acoustic', 'guitar'],
        uploadDate: new Date('2024-02-01T18:00:00Z').toISOString(),
    },
];

export async function getAllContentForUser(userId: string): Promise<ProtectedContent[]> {
    noStore();
    const userContent = protectedContent.filter(c => c.creatorId === userId);
    return JSON.parse(JSON.stringify(userContent));
}

export async function createContent(data: Omit<ProtectedContent, 'id' | 'uploadDate'>): Promise<ProtectedContent> {
    noStore();
    const newContent: ProtectedContent = {
        ...data,
        id: `content_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        uploadDate: new Date().toISOString(),
    };
    protectedContent.unshift(newContent); // Add to the beginning of the array
    return JSON.parse(JSON.stringify(newContent));
}
