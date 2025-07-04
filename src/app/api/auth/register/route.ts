
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail } from '@/lib/users-store';

export async function POST(request: Request) {
  try {
    const { email, password, displayName } = await request.json();

    if (!email || !password || !displayName) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await createUser({
      email,
      password: hashedPassword,
      displayName,
      role: 'creator',
      joinDate: new Date().toISOString(),
      status: 'active',
      platformsConnected: [],
      avatar: `https://placehold.co/128x128.png`
    });
    
    // We don't sign in the user automatically, redirect them to login
    return NextResponse.json({ success: true, message: 'Registration successful! Please log in.' }, { status: 201 });

  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
