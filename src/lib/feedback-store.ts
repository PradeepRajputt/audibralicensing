
'use server';
import type { Feedback, FeedbackReply } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

// Mock in-memory database for feedback
let mockFeedback: Feedback[] = [
    {
        feedbackId: 'fb_1',
        creatorId: 'user_creator_123',
        creatorName: 'Sample Creator',
        avatar: 'https://placehold.co/128x128.png',
        rating: 5,
        title: 'Love the new dashboard!',
        tags: ['ui', 'ux', 'feature'],
        description: 'The new analytics dashboard is amazing. So much easier to see my stats.',
        message: 'Keep up the great work!',
        response: [{
            replyId: 'reply_1',
            adminName: 'Admin',
            message: 'Thanks for the feedback! We are glad you like it.',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
        }],
        isReadByCreator: false,
        timestamp: new Date(Date.now() - 172800000).toISOString(),
    },
    {
        feedbackId: 'fb_admin_1',
        creatorId: 'user_admin_123',
        creatorName: 'Admin User',
        avatar: 'https://placehold.co/128x128.png',
        rating: 4,
        title: 'Suggestion for strike reviews',
        tags: ['admin', 'workflow'],
        description: 'It would be helpful to see a side-by-side comparison of the content during strike reviews.',
        response: [],
        isReadByCreator: true,
        timestamp: new Date(Date.now() - 259200000).toISOString(),
    }
];

export async function getAllFeedback(): Promise<Feedback[]> {
    noStore();
    return Promise.resolve(mockFeedback.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
}

export async function getFeedbackForUser(creatorId: string): Promise<Feedback[]> {
    noStore();
    return Promise.resolve(
        mockFeedback.filter(f => f.creatorId === creatorId)
                    .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    );
}

export async function addFeedback(data: Omit<Feedback, 'feedbackId' | 'timestamp' | 'response' | 'isReadByCreator'>): Promise<Feedback> {
    noStore();
    const newFeedback: Feedback = {
        ...data,
        feedbackId: `feedback_${Date.now()}`,
        timestamp: new Date().toISOString(),
        response: [],
        isReadByCreator: true,
    };
    mockFeedback.unshift(newFeedback);
    return Promise.resolve(newFeedback);
}

export async function addReplyToFeedback(feedbackId: string, reply: Omit<FeedbackReply, 'replyId' | 'timestamp'>): Promise<void> {
    noStore();
    const feedback = mockFeedback.find(f => f.feedbackId === feedbackId);
    if (!feedback) {
        throw new Error('Feedback not found');
    }
    const newReply: FeedbackReply = {
        ...reply,
        replyId: `reply_${Date.now()}`,
        timestamp: new Date().toISOString()
    };
    feedback.response.push(newReply);
    feedback.isReadByCreator = false;
}

export async function markFeedbackAsRead(feedbackId: string): Promise<void> {
    noStore();
    const feedback = mockFeedback.find(f => f.feedbackId === feedbackId);
    if (feedback) {
        feedback.isReadByCreator = true;
    }
}

export async function hasUnreadCreatorFeedback(creatorId: string): Promise<boolean> {
    noStore();
    const hasUnread = mockFeedback.some(f => 
        f.creatorId === creatorId &&
        f.response.length > 0 &&
        !f.isReadByCreator
    );
    return Promise.resolve(hasUnread);
}

export async function hasUnrepliedAdminFeedback(): Promise<boolean> {
    noStore();
    const hasUnreplied = mockFeedback.some(f => f.response.length === 0);
    return Promise.resolve(hasUnreplied);
}
