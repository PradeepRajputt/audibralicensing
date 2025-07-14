import { NextApiRequest, NextApiResponse } from 'next';
import { addProtectedContentAction } from '@/app/dashboard/content/new/actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { values, userEmail } = req.body;
  const result = await addProtectedContentAction(values, userEmail);
  res.status(200).json(result);
} 