
'use server';
import type { Feedback, FeedbackReply } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

let feedbackStore: Feedback[] = [
    {
        feedbackId: 'feedback_1',
        creatorId: 'user_creator_123',
        creatorName: 'Sample Creator',
        avatar: 'https://placehold.co/128x128.png',
        rating: 4,
        title: 'Great analytics dashboard!',
        tags: ['analytics', 'feature-request'],
        description: 'The new analytics dashboard is amazing, but it would be great to see a breakdown by video.',
        message: 'Keep up the great work, team!',
        response: [],
        isReadByCreator: true,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        feedbackId: 'feedback_2',
        creatorId: 'user_creator_456',
        creatorName: 'Alice Vlogs',
        avatar: 'https://placehold.co/128x128.png',
        rating: 5,
        title: 'Love the new monitoring feature',
        tags: ['monitoring', 'positive'],
        description: 'Just tried the web monitoring and it found a site I never would have known about. Super useful!',
        message: '',
        response: [
            {
                replyId: 'reply_1',
                adminName: 'Admin',
                message: 'Thanks for the positive feedback, Alice! We are glad you are finding it useful.',
                timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            }
        ],
        isReadByCreator: false,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    }
];

export async function getAllFeedback(): Promise<Feedback[]> {
    noStore();
    return JSON.parse(JSON.stringify(feedbackStore.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())));
}

export async function getFeedbackForUser(creatorId: string): Promise<Feedback[]> {
    noStore();
    const userFeedback = feedbackStore.filter(f => f.creatorId === creatorId);
    return JSON.parse(JSON.stringify(userFeedback.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())));
}

export async function addFeedback(data: Omit<Feedback, 'feedbackId' | 'timestamp' | 'response' | 'isReadByCreator'>): Promise<Feedback> {
    noStore();
    const newFeedback: Feedback = {
        ...data,
        feedbackId: `feedback_${Date.now()}`,
        timestamp: new Date().toISOString(),
        response: [],
        isReadByCreator: true, // Creator has "read" their own submission.
    };
    feedbackStore.unshift(newFeedback);
    return JSON.parse(JSON.stringify(newFeedback));
}

export async function addReplyToFeedback(feedbackId: string, reply: Omit<FeedbackReply, 'replyId' | 'timestamp'>): Promise<void> {
    noStore();
    const feedbackIndex = feedbackStore.findIndex(f => f.feedbackId === feedbackId);
    if (feedbackIndex === -1) {
        throw new Error('Feedback not found');
    }
    const newReply: FeedbackReply = {
        ...reply,
        replyId: `reply_${Date.now()}`,
        timestamp: new Date().toISOString()
    };
    feedbackStore[feedbackIndex].response.push(newReply);
    feedbackStore[feedbackIndex].isReadByCreator = false; // Mark as unread for the creator
}

export async function markFeedbackAsRead(feedbackId: string): Promise<void> {
    noStore();
    const feedbackIndex = feedbackStore.findIndex(f => f.feedbackId === feedbackId);
    if (feedbackIndex !== -1) {
        feedbackStore[feedbackIndex].isReadByCreator = true;
    }
}
