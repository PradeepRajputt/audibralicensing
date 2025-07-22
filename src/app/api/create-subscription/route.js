import Razorpay from 'razorpay';
import dbConnect from '@/lib/mongodb';
import Creator from '@/models/Creator';

export async function POST(req) {
  const body = await req.json();
  const { planId, userId } = body;
  await dbConnect();
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: planId === 'plan_QvemyKdfzVGTLc4' ? 12 : 1,
    });
    await Creator.findByIdAndUpdate(userId, {
      subscriptionId: subscription.id,
      plan: planId === 'plan_QvemyKdfzVGTLc4' ? 'monthly' : 'yearly',
      planExpiry: null,
    });
    return Response.json({ subscriptionId: subscription.id });
  } catch (err) {
    console.error('CREATE SUBSCRIPTION ERROR:', err);
    return Response.json({ error: err.message, details: err }, { status: 500 });
  }
} 