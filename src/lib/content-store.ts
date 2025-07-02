
'use server';
import type { ProtectedContent } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

let mockContent: ProtectedContent[] = [
    {
        id: 'content_1',
        creatorId: 'user_creator_123',
        contentType: 'video',
        videoURL: 'https://youtube.com/watch?v=original123',
        title: 'My Most Epic Adventure Yet!',
        tags: ['travel', 'adventure', 'vlog'],
        platform: 'youtube',
        uploadDate: new Date('2024-05-15T10:00:00Z').toISOString(),
        status: 'active',
        lastChecked: new Date().toISOString(),
    },
    {
        id: 'content_2',
        creatorId: 'user_creator_123',
        contentType: 'video',
        videoURL: 'https://youtube.com/watch?v=original456',
        title: 'How to Bake the Perfect Sourdough',
        tags: ['baking', 'cooking', 'tutorial'],
        platform: 'youtube',
        uploadDate: new Date('2024-04-22T10:00:00Z').toISOString(),
        status: 'active',
        lastChecked: new Date().toISOString(),
    },
    {
        id: 'content_3',
        creatorId: 'user_creator_123',
        contentType: 'text',
        videoURL: 'https://myblog.com/summer-in-italy',
        title: 'My Travel Blog - Summer in Italy',
        tags: ['travel', 'italy', 'blog'],
        platform: 'web',
        uploadDate: new Date('2024-03-10T10:00:00Z').toISOString(),
        status: 'active',
        lastChecked: new Date().toISOString(),
    },
     {
        id: 'content_4',
        creatorId: 'user_creator_123',
        contentType: 'audio',
        videoURL: 'https://vimeo.com/123456',
        title: 'Acoustic Guitar Session',
        tags: ['music', 'acoustic', 'guitar'],
        platform: 'vimeo',
        uploadDate: new Date('2024-02-01T10:00:00Z').toISOString(),
        status: 'inactive',
        lastChecked: new Date().toISOString(),
    }
];

export async function getAllContentForUser(userId: string): Promise<ProtectedContent[]> {
    noStore();
    console.log(`MOCK: Fetching all content for user: ${userId}`);
    return Promise.resolve(mockContent.filter(c => c.creatorId === userId).sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
}

export async function getContentById(contentId: string): Promise<ProtectedContent | undefined> {
    noStore();
    console.log(`MOCK: Fetching content by ID: ${contentId}`);
    return Promise.resolve(mockContent.find(c => c.id === contentId));
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
    mockContent.unshift(newContent);
    console.log("MOCK: Creating new content", newContent);
    return Promise.resolve(newContent);
}

export async function deleteContentById(contentId: string): Promise<void> {
    noStore();
    const initialLength = mockContent.length;
    mockContent = mockContent.filter(c => c.id !== contentId);
    if (mockContent.length === initialLength) {
        throw new Error("Content not found.");
    }
    console.log(`MOCK: Deleting content with ID: ${contentId}`);
}

export async function updateContentTags(contentId: string, tags: string[]): Promise<ProtectedContent> {
    noStore();
    let updatedContent: ProtectedContent | undefined;
    mockContent = mockContent.map(c => {
        if (c.id === contentId) {
            updatedContent = { ...c, tags };
            return updatedContent;
        }
        return c;
    });
    if (!updatedContent) {
        throw new Error("Content not found.");
    }
    console.log(`MOCK: Updating tags for content ID: ${contentId}`);
    return Promise.resolve(updatedContent);
}

export async function requestRescan(contentId: string): Promise<ProtectedContent> {
    noStore();
     let updatedContent: ProtectedContent | undefined;
    mockContent = mockContent.map(c => {
        if (c.id === contentId) {
            updatedContent = { ...c, lastChecked: new Date().toISOString() };
            return updatedContent;
        }
        return c;
    });
    if (!updatedContent) {
        throw new Error("Content not found.");
    }
    console.log(`MOCK: Rescanning content ID: ${contentId}`);
    return Promise.resolve(updatedContent);
}
