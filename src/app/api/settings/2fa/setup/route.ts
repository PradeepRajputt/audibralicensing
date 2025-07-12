import connectToDatabase from '@/lib/mongodb';
import Creator from '@/models/Creator.js';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  await connectToDatabase();
  const secret = speakeasy.generateSecret({ name: `CreatorShield (${email})` });
  await Creator.updateOne({ email }, { $set: { twoFactorSecret: secret.base32 } });
  const otpauth_url = secret.otpauth_url;
  const qr = await QRCode.toDataURL(otpauth_url);
  return NextResponse.json({ otpauth_url, qr, secret: secret.base32 });
} 