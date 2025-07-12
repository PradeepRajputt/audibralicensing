import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator';
import Admin from '@/models/Admin';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const ADMIN_EMAILS = [
  'guddumis003@gmail.com',
  'contactpradeeprajput@gmail.com',
];

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  await connectToDatabase();
  if (ADMIN_EMAILS.includes(email)) {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = jwt.sign({ id: admin._id, email: admin.email, name: admin.name, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return NextResponse.json({ token, user: { id: admin._id, email: admin.email, name: admin.name, role: 'admin' } });
  } else {
    // Fix: Creator.findOne is not callable directly, use Creator.findOne.call or ensure correct import
    const user = await (Creator as any).findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = jwt.sign({ id: user._id, email: user.email, name: user.name, role: 'creator' }, JWT_SECRET, { expiresIn: '7d' });
    return NextResponse.json({ token, user: { id: user._id, email: user.email, name: user.name, role: 'creator' } });
  }
} 