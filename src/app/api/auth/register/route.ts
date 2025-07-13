import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator';
import Admin from '@/models/Admin';

const ADMIN_EMAILS = [
  'guddumis003@gmail.com',
  'contactpradeeprajput@gmail.com',
];

export async function POST(req: Request) {
  const { name, email, password, location, avatar } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  await connectToDatabase();
  if (ADMIN_EMAILS.includes(email)) {
    const existing = await Admin.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    await Admin.create({ name, email, password: hashed, location: location || 'N/A' });
    return NextResponse.json({ success: true, role: 'admin' });
  } else {
    const existing = await Creator.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    await Creator.create({ name, email, password: hashed, avatar });
    return NextResponse.json({ success: true, role: 'creator' });
  }
} 