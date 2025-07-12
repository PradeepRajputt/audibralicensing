import connectToDatabase from '@/lib/mongodb';
import CreatorImport from '@/models/Creator.js';
const Creator = CreatorImport as any;
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
  user.twoFactorEnabled = true;
  await user.save();
  return NextResponse.json({ success: true });
} 