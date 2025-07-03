
'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByDisplayName } from '@/lib/users-store';

export async function POST(req: NextRequest) {
  try {
    const { displayName, faceDescriptor } = await req.json();

    if (!displayName || !faceDescriptor) {
      return NextResponse.json({ message: 'Display name and face descriptor are required.' }, { status: 400 });
    }

    if (!Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
      return NextResponse.json({ message: 'Invalid face descriptor format.' }, { status: 400 });
    }

    const existingUser = await getUserByDisplayName(displayName);
    if (existingUser) {
      return NextResponse.json({ message: 'A user with this name already exists. Please choose another.' }, { status: 409 });
    }
    
    await createUser({
      email: `${displayName.toLowerCase().replace(/\s/g, '_')}@creatorshield.face`, // Create a dummy email
      displayName,
      faceDescriptor,
      role: 'creator', 
    });

    return NextResponse.json({ success: true, message: 'Registration successful! You can now log in.' }, { status: 201 });

  } catch (error) {
    console.error('Face registration error:', error);
    const message = error instanceof Error ? error.message : 'An internal server error occurred.';
    return NextResponse.json({ message }, { status: 500 });
  }
}

