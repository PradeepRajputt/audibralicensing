
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
        status: 'active',
        lastChecked: new Date(Date.now() - (2 * 60 * 60 * 1000)).toISOString(),
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
        status: 'active',
        lastChecked: new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString(),
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
        status: 'active',
        lastChecked: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
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
        status: 'inactive',
        lastChecked: new Date('2024-02-05T18:00:00Z').toISOString(),
    },
];

export async function getAllContentForUser(userId: string): Promise<ProtectedContent[]> {
    noStore();
    const userContent = protectedContent.filter(c => c.creatorId === userId);
    return JSON.parse(JSON.stringify(userContent.sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())));
}

export async function getContentById(contentId: string): Promise<ProtectedContent | undefined> {
    noStore();
    const content = protectedContent.find(c => c.id === contentId);
    return content ? JSON.parse(JSON.stringify(content)) : undefined;
}

export async function createContent(data: Omit<ProtectedContent, 'id' | 'uploadDate' | 'status' | 'lastChecked'>): Promise<ProtectedContent> {
    noStore();
    const newContent: ProtectedContent = {
        ...data,
        id: `content_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        uploadDate: new Date().toISOString(),
        status: 'active',
        lastChecked: new Date().toISOString()
    };
    protectedContent.unshift(newContent); // Add to the beginning of the array
    return JSON.parse(JSON.stringify(newContent));
}

export async function deleteContentById(contentId: string): Promise<void> {
    noStore();
    const initialLength = protectedContent.length;
    protectedContent = protectedContent.filter(c => c.id !== contentId);
    if (protectedContent.length === initialLength) {
        throw new Error("Content not found.");
    }
}

export async function updateContentTags(contentId: string, tags: string[]): Promise<ProtectedContent> {
    noStore();
    const contentIndex = protectedContent.findIndex(c => c.id === contentId);
    if (contentIndex === -1) {
        throw new Error("Content not found.");
    }
    protectedContent[contentIndex].tags = tags;
    return JSON.parse(JSON.stringify(protectedContent[contentIndex]));
}

export async function requestRescan(contentId: string): Promise<ProtectedContent> {
    noStore();
    const contentIndex = protectedContent.findIndex(c => c.id === contentId);
     if (contentIndex === -1) {
        throw new Error("Content not found.");
    }
    // Simulate a scan by updating the lastChecked date
    protectedContent[contentIndex].lastChecked = new Date().toISOString();
    return JSON.parse(JSON.stringify(protectedContent[contentIndex]));
}
