import { NextApiRequest, NextApiResponse } from 'next';
import { getUserByEmail } from '@/lib/users-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.query;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid email' });
  }
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.status(200).json({ id: user._id.toString() });
} 