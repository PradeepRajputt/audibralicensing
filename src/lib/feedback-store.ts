
'use server';
import type { Feedback, FeedbackReply } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import connectToDatabase from './mongodb';
import Creator from '../models/Creator.js';
import mongoose from 'mongoose';

// Remove mockFeedback and all in-memory logic

export async function approveDisconnectForCreator(creatorId: string) {
  // Set disconnectApproved to true for this creator
  await Creator.updateOne({ _id: creatorId }, { $set: { disconnectApproved: true } });
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
  // Update the status of the specific feedback to 'admin read'
  await (await import('../models/Feedback.js')).default.updateOne(
    { 'feedbacks._id': feedbackId },
    { $set: { 'feedbacks.$.status': 'admin read' } }
  );
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

export async function getAllFeedbackFromDb(): Promise<any[]> {
  await connectToDatabase();
  // Get all feedback docs
  const feedbackDocs = await (await import('../models/Feedback.js')).default.find({}).lean();
  // For each feedback, get creator info and flatten feedbacks
  let allFeedbacks = [];
  for (const doc of feedbackDocs) {
    const creator = await Creator.findById(doc.creatorId).lean();
    for (const fb of doc.feedbacks) {
      allFeedbacks.push({
        ...fb,
        creatorId: doc.creatorId,
        creatorName: creator?.name || '',
        creatorEmail: creator?.email || '',
        avatar: creator?.avatar || '',
        youtubeChannel: creator?.youtubeChannel || {},
        youtubeChannelId: creator?.youtubeChannelId || '',
      });
    }
  }
  // Sort by createdAt descending
  allFeedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return allFeedbacks;
}
