import connectToDatabase from '@/lib/mongodb';
import Feedback from '@/models/Feedback.js';
import Creator from '@/models/Creator.js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await connectToDatabase();
  const data = await req.json();
  const { creatorEmail, creatorName, ...feedbackData } = data;
  if (!creatorEmail) {
    return NextResponse.json({ success: false, message: 'Missing creatorEmail' }, { status: 400 });
  }
  // Find creator by email
  const creator = await Creator.findOne({ email: creatorEmail });
  if (!creator) {
    return NextResponse.json({ success: false, message: 'Creator not found' }, { status: 404 });
  }
  try {
    // Always push feedback to the creator's feedbacks array
    let feedbackDoc = await Feedback.findOne({ creatorId: creator._id });
    if (!feedbackDoc) {
      // Create new feedback doc for this creator
      feedbackDoc = new Feedback({ creatorId: creator._id, feedbacks: [] });
    }
    feedbackDoc.feedbacks.push({ ...feedbackData, creatorName, createdAt: new Date() });
    await feedbackDoc.save();
    return NextResponse.json({ success: true, feedback: feedbackDoc });
  } catch (err) {
    console.error('Feedback save error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
} 