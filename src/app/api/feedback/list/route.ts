import connectToDatabase from '@/lib/mongodb';
import Feedback from '@/models/Feedback.js';
import Creator from '@/models/Creator.js';
import { NextResponse } from 'next/server';

export async function GET(req) {
  await connectToDatabase();
  // Get all feedback docs
  const feedbackDocs = await Feedback.find({}).lean();
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
  return NextResponse.json(allFeedbacks);
} 