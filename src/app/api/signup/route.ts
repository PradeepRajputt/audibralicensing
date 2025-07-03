
'use server';
import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/users-store';

export async function POST(req: NextRequest) {
  try {
    const { displayName, email, password, role = 'creator' } = await req.json();

    if (!displayName || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }
    
    if(password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
    }
    
    // The createUser function now handles hashing
    await createUser({
      email,
      displayName,
      role,
      passwordPlain: password, 
    });

    return NextResponse.json({ success: true, message: 'User created successfully.' }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    const message = error instanceof Error ? error.message : 'An internal server error occurred.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
