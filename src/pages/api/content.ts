import { NextApiRequest, NextApiResponse } from 'next';
import { getAllContentForUser } from '@/lib/content-store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { creatorId } = req.query;
  if (!creatorId || typeof creatorId !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid creatorId' });
  }
  const content = await getAllContentForUser(creatorId);
  res.status(200).json(content);
} 