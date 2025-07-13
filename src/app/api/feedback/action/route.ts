import connectToDatabase from '@/lib/mongodb';
import Feedback from '@/models/Feedback.js';
import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/send-mail';

export async function POST(req: Request) {
  await connectToDatabase();
  const { feedbackId, action } = await req.json();
  const feedback = await Feedback.findById(feedbackId);
  if (!feedback) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  feedback.status = action === 'approve' ? 'approved' : 'rejected';
  await feedback.save();

  if (action === 'approve') {
    await sendMail({
      to: feedback.creator.email,
      subject: 'YouTube Channel Disconnect/Change Request Approved',
      text: `Aapne YouTube channel disconnect/change ki request ki hai. Dhyan rahe kisi aur ka channel connect na kare, warna account suspend ho sakta hai.`
    });
  }

  return NextResponse.json({ success: true });
} 