
'use server';
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/password';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const { displayName, email, password, role = 'creator' } = await req.json();

    if (!displayName || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
    }
    
    if(password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
    }
    
    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      displayName,
      email,
      password: hashedPassword,
      role,
      joinDate: new Date().toISOString(),
      status: 'active',
      platformsConnected: [],
      avatar: `https://placehold.co/128x128.png?text=${displayName.charAt(0)}`
    });

    await newUser.save();

    return NextResponse.json({ success: true, message: 'User created successfully.' }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
