import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Creator from '@/models/Creator';

const otpStore = global.otpEmailStore || (global.otpEmailStore = {});

export async function POST(req) {
  const { email } = await req.json();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }
  try {
    await dbConnect();
    const creator = await Creator.findOne({ email });
    if (!creator) {
      return NextResponse.json({ error: 'Email not registered' }, { status: 400 });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    // Send email using Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL,
        to: email,
        subject: 'Your CreatorShield OTP',
        html: `<p>Your OTP for <b>CreatorShield</b> is: <b>${otp}</b></p>`
      })
    });
    if (!res.ok) {
      const error = await res.json();
      return NextResponse.json({ error: 'Failed to send OTP', details: error }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('SEND EMAIL OTP ERROR:', err);
    return NextResponse.json({ error: 'Failed to send OTP', details: err.message }, { status: 500 });
  }
} 