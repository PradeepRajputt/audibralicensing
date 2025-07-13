import connectToDatabase from '@/lib/mongodb';
import Feedback from '@/models/Feedback.js';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectToDatabase();
  const feedbacks = await Feedback.find({ type: { $in: ['disconnect-request', 'change-channel-request'] } }).sort({ createdAt: -1 });
  return NextResponse.json({ feedbacks });
} 