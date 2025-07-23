import { NextResponse } from 'next/server';
import twilio from 'twilio';

const otpStore = global.otpStore || (global.otpStore = {});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function POST(req) {
  const { phone } = await req.json();
  if (!/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
  }
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore[phone] = { otp, expires: Date.now() + 5 * 60 * 1000 };
  try {
    await client.messages.create({
      body: `Your CreatorShield OTP is: ${otp}`,
      from: twilioNumber.startsWith('+') ? twilioNumber : `+91${twilioNumber}`,
      to: `+91${phone}`
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send OTP', details: err.message }, { status: 500 });
  }
} 