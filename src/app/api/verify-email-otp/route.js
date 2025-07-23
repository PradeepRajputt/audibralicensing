import { NextResponse } from 'next/server';

const otpStore = global.otpEmailStore || (global.otpEmailStore = {});

export async function POST(req) {
  const { email, otp } = await req.json();
  if (!email || !/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(otp)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const record = otpStore[email];
  if (!record || record.otp !== otp) {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
  }
  if (Date.now() > record.expires) {
    return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
  }
  delete otpStore[email];
  return NextResponse.json({ success: true });
} 