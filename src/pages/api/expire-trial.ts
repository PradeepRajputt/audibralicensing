import dbConnect from '@/lib/mongodb';
import Creator from '@/models/Creator';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await dbConnect();
  const email = req.body.email || req.query.email;
  if (!email) return res.status(400).json({ error: 'Email required' });

  // Use .findOne() as a method, not as a callable object
  const user = await Creator.findOne({ email: email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.plan = 'expired';
  user.planExpiry = new Date();
  await user.save();
  res.status(200).json({ status: 'expired' });
} 