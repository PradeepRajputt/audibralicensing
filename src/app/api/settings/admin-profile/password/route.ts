import { NextResponse } from 'next/server';
import Admin from '@/models/Admin';
import connectToDatabase from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and new password are required' }, { status: 400 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const admin = await Admin.findOneAndUpdate({ email }, { password: hashed }, { new: true });
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
} 