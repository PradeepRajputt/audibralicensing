import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator.js';
import speakeasy from 'speakeasy';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, code } = await req.json();
  if (!email || !code) return NextResponse.json({ error: 'Missing email or code' }, { status: 400 });
  await connectToDatabase();
  const user = await Creator.findOne({ email });
  if (!user || !user.twoFactorSecret) return NextResponse.json({ error: '2FA not set up' }, { status: 400 });
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token: code,
    window: 1,
  });
  if (!verified) return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save();
  return NextResponse.json({ success: true });
} 