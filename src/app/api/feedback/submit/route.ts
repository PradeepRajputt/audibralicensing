import connectToDatabase from '@/lib/mongodb';
import Feedback from '@/models/Feedback.js';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await connectToDatabase();
  const data = await req.json();
  const { creatorEmail, creatorName, ...feedbackData } = data;
  if (!creatorEmail) {
    return NextResponse.json({ success: false, message: 'Missing creatorEmail' }, { status: 400 });
  }
  // Upsert feedback for this creator
  const result = await Feedback.findOneAndUpdate(
    { creatorEmail },
    {
      $setOnInsert: { creatorEmail, creatorName },
      $push: { feedbacks: { ...feedbackData, createdAt: new Date() } },
    },
    { upsert: true, new: true }
  );
  return NextResponse.json({ success: true, feedback: result });
} 