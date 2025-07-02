
'use server';
import type { Feedback, FeedbackReply } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import clientPromise from './mongodb';

async function getFeedbackCollection() {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    return db.collection<Feedback>('feedback');
}

export async function getAllFeedback(): Promise<Feedback[]> {
    noStore();
    const collection = await getFeedbackCollection();
    const feedback = await collection.find({}, { projection: { _id: 0 } }).sort({ timestamp: -1 }).toArray();
    return feedback as Feedback[];
}

export async function getFeedbackForUser(creatorId: string): Promise<Feedback[]> {
    noStore();
    const collection = await getFeedbackCollection();
    const feedback = await collection.find({ creatorId }, { projection: { _id: 0 } }).sort({ timestamp: -1 }).toArray();
    return feedback as Feedback[];
}

export async function addFeedback(data: Omit<Feedback, 'feedbackId' | 'timestamp' | 'response' | 'isReadByCreator'>): Promise<Feedback> {
    noStore();
    const collection = await getFeedbackCollection();
    const newFeedback: Feedback = {
        ...data,
        feedbackId: `feedback_${Date.now()}`,
        timestamp: new Date().toISOString(),
        response: [],
        isReadByCreator: true,
    };
    await collection.insertOne(newFeedback);
    return newFeedback;
}

export async function addReplyToFeedback(feedbackId: string, reply: Omit<FeedbackReply, 'replyId' | 'timestamp'>): Promise<void> {
    noStore();
    const collection = await getFeedbackCollection();
    const newReply: FeedbackReply = {
        ...reply,
        replyId: `reply_${Date.now()}`,
        timestamp: new Date().toISOString()
    };
    const result = await collection.updateOne(
        { feedbackId },
        { $push: { response: newReply }, $set: { isReadByCreator: false } }
    );
    if (result.matchedCount === 0) {
        throw new Error('Feedback not found');
    }
}

export async function markFeedbackAsRead(feedbackId: string): Promise<void> {
    noStore();
    const collection = await getFeedbackCollection();
    await collection.updateOne({ feedbackId }, { $set: { isReadByCreator: true } });
}

export async function hasUnreadCreatorFeedback(creatorId: string): Promise<boolean> {
    noStore();
    const collection = await getFeedbackCollection();
    const count = await collection.countDocuments({
      creatorId,
      response: { $exists: true, $not: { $size: 0 } },
      isReadByCreator: false
    });
    return count > 0;
}

export async function hasUnrepliedAdminFeedback(): Promise<boolean> {
    noStore();
    const collection = await getFeedbackCollection();
    const count = await collection.countDocuments({ response: { $size: 0 } });
    return count > 0;
}
