import { NextResponse } from 'next/server';
import { getUserByEmail, updateUser } from '@/lib/users-store';

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ success: false, error: 'Missing email' }, { status: 400 });
    const creator = await getUserByEmail(email);
    if (!creator) return NextResponse.json({ success: false, error: 'Creator not found' }, { status: 404 });
    if (!creator.disconnectApproved) {
      return NextResponse.json({ success: false, error: 'Channel disconnection is restricted. Please request admin approval.' }, { status: 403 });
    }
    // Clear YouTube channel info and reset approval
    await updateUser(creator._id.toString(), {
      youtubeChannel: undefined,
      youtubeChannelId: undefined,
      disconnectApproved: false,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
} 