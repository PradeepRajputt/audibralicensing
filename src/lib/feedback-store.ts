
'use server';
import type { Feedback, FeedbackReply } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

// Remove mockFeedback and all in-memory logic

export async function approveDisconnectForCreator(creatorId: string) {
  // TODO: Implement this with real DB if needed
  return;
}

export async function isDisconnectApproved(creatorId: string): Promise<boolean> {
  // TODO: Implement this with real DB if needed
  return false;
}

function getApiBaseUrl() {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }
  return '';
}

export async function getAllFeedback(): Promise<any[]> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/feedback/list`);
  if (!res.ok) throw new Error('Failed to fetch feedback');
  return await res.json();
}

export async function getFeedbackForUser(creatorEmail: string): Promise<any[]> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/feedback/list?email=${encodeURIComponent(creatorEmail)}`);
  if (!res.ok) throw new Error('Failed to fetch feedback for user');
  return await res.json();
}

export async function addFeedback(data: any): Promise<any> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}/api/feedback/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit feedback');
  return await res.json();
}

export async function addReplyToFeedback(feedbackId: string, reply: Omit<FeedbackReply, 'replyId' | 'timestamp'>): Promise<void> {
  // TODO: Implement this with real DB if needed
  return;
}

export async function markFeedbackAsRead(feedbackId: string): Promise<void> {
  // TODO: Implement this with real DB if needed
  return;
}

export async function hasUnreadCreatorFeedback(email: string): Promise<boolean> {
  const docs = await getFeedbackForUser(email);
  if (!Array.isArray(docs) || docs.length === 0) return false;
  const feedbacks = docs[0].feedbacks || [];
  // Update this logic as per your feedback object structure
  // If you want to check for unread, you can add a field like isRead in feedback object
  // For now, just check if there is at least one feedback
  return feedbacks.length > 0;
}

export async function hasUnrepliedAdminFeedback(): Promise<boolean> {
  const feedbacks = await getAllFeedback();
  if (!Array.isArray(feedbacks)) return false;
  const hasUnreplied = feedbacks.some(f => f.response && f.response.length === 0);
  return hasUnreplied;
}
