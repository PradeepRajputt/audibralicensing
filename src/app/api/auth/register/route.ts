
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
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await createUser({
      email,
      password: hashedPassword,
      displayName,
      role: 'creator',
      joinDate: new Date().toISOString(),
      status: 'active',
      platformsConnected: [],
      avatar: `https://placehold.co/128x128.png`
    });
    
    return NextResponse.json({ success: true, message: 'Registration successful! Please log in.' }, { status: 201 });

  } catch (error) {
    if (error instanceof Error) {
        console.error('Registration Error:', error.message);
        // Check for duplicate key error from MongoDB, which has code 11000
        if (error.message.includes('E11000 duplicate key error')) {
            return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
        }
    } else {
        console.error('An unknown registration error occurred:', error);
    }
    return NextResponse.json({ message: 'An internal server error occurred during registration.' }, { status: 500 });
  }
}
