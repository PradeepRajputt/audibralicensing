import { NextResponse } from 'next/server';

const otpStore = global.otpStore || (global.otpStore = {});

export async function POST(req) {
  const { phone, otp } = await req.json();
  if (!/^\d{10}$/.test(phone) || !/^\d{4}$/.test(otp)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }
  const record = otpStore[phone];
  if (!record || record.otp !== otp) {
    return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
  }
  if (Date.now() > record.expires) {
    return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
  }
  delete otpStore[phone];
  return NextResponse.json({ success: true });
} 