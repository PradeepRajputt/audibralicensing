
'use server';
import type { ProtectedContent } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import ContentModel from '../models/Content.js';
import mongoose from 'mongoose';

export async function getAllContentForUser(userId: string): Promise<ProtectedContent[]> {
    noStore();
    if (!mongoose.Types.ObjectId.isValid(userId)) return [];
    try {
        const doc = await ContentModel.findOne({ creatorId: new mongoose.Types.ObjectId(userId) });
        if (!doc || !doc.contents) return [];
        // Add id field to each content object (use its _id)
        return doc.contents.map((c: any) => ({ ...c.toObject(), id: c._id.toString(), _id: c._id.toString() }));
    } catch (err) {
        console.error('Error fetching content for user:', err);
        return [];
    }
}

export async function getContentById(contentId: string): Promise<ProtectedContent | undefined> {
    noStore();
    if (!mongoose.Types.ObjectId.isValid(contentId)) return undefined;
    try {
        // Search for the content in all creators' contents arrays
        const doc = await ContentModel.findOne({ 'contents._id': new mongoose.Types.ObjectId(contentId) });
        if (!doc) return undefined;
        const content = doc.contents.id(contentId);
        return content ? { ...content.toObject(), id: content._id.toString() } : undefined;
    } catch (err) {
        console.error('Error fetching content by id:', err);
        return undefined;
    }
}

export async function createContent(data: Omit<ProtectedContent, 'id' | 'uploadDate' | 'status' | 'lastChecked'>): Promise<ProtectedContent | undefined> {
    noStore();
    try {
        const creatorObjectId = new mongoose.Types.ObjectId(data.creatorId);
        const contentObj = {
            contentType: data.contentType,
            videoURL: data.videoURL,
            title: data.title,
            tags: data.tags,
            platform: data.platform,
            uploadDate: new Date().toISOString(),
            status: 'active',
            lastChecked: new Date().toISOString(),
        };
        const result = await ContentModel.findOneAndUpdate(
            { creatorId: creatorObjectId },
            { $push: { contents: contentObj } },
            { upsert: true, new: true }
        );
        // Return the last added content object with id
        const lastContent = result.contents[result.contents.length - 1];
        return lastContent ? { ...lastContent.toObject(), id: lastContent._id.toString() } : undefined;
    } catch (err) {
        console.error('Error creating content:', err);
        return undefined;
    }
}

export async function deleteContentById(contentId: string): Promise<void> {
    noStore();
    // This function is no longer needed as mockContent is removed.
    // If you need to delete content, you would use a database model.
    // For now, we'll just log a message.
    console.log(`MOCK: Deleting content with ID: ${contentId}`);
}

export async function updateContentTags(contentId: string, tags: string[]): Promise<ProtectedContent> {
    noStore();
    // This function is no longer needed as mockContent is removed.
    // If you need to update tags, you would use a database model.
    // For now, we'll just log a message.
    console.log(`MOCK: Updating tags for content ID: ${contentId}`);
    return Promise.resolve({} as ProtectedContent); // Return a dummy or throw an error
}

export async function requestRescan(contentId: string): Promise<ProtectedContent | undefined> {
    noStore();
    if (!mongoose.Types.ObjectId.isValid(contentId)) return undefined;
    try {
        const content = await ContentModel.findById(contentId);
        if (content) {
            content.lastChecked = new Date().toISOString();
            await content.save();
            const obj = content.toObject();
            return { ...obj, id: obj._id.toString() };
        }
        return undefined;
    } catch (err) {
        console.error('Error rescanning content:', err);
        return undefined;
    }
}
