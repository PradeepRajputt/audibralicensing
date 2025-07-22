import dbConnect from '@/lib/mongodb';
import Creator from '@/models/Creator';
import bcrypt from 'bcryptjs';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  await dbConnect();
  const { name, email, password, plan, role } = req.body;
  if (!name || !email || !password || !plan || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  const existing = await Creator.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already registered.' });
  const hashed = await bcrypt.hash(password, 10);
  const creator = await Creator.create({
    name,
    email,
    password: hashed,
    plan,
    status: 'active',
    trialStart: plan === 'free' ? new Date() : undefined,
    createdAt: new Date(),
    // role is not in schema, but you can add it if needed
  });
  res.status(201).json({ success: true, id: creator._id });
} 