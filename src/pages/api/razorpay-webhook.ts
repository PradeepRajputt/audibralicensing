import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Creator from '@/models/Creator';

export default async function handler(req, res) {
  await dbConnect();
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body.event;
  const subscriptionId = req.body.payload.subscription.entity.id;
  const creator = await Creator.findOne({ subscriptionId });

  if (!creator) return res.status(404).json({ error: 'Creator not found' });

  if (event === 'subscription.activated') {
    creator.plan = creator.plan === 'monthly' ? 'monthly' : 'yearly';
    creator.planExpiry = new Date(req.body.payload.subscription.entity.current_end * 1000);
    await creator.save();
  } else if (event === 'subscription.completed' || event === 'subscription.cancelled') {
    creator.plan = 'expired';
    creator.planExpiry = new Date();
    await creator.save();
  }
  res.status(200).json({ status: 'ok' });
} 