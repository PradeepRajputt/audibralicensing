
'use server';

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from '@/lib/users-store';
import { comparePassword } from '@/lib/password';
import type { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }

    // Fetch user with password hash
    const userDoc = await getUserByEmail(email, true);
    if (!userDoc || !userDoc.password) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    const isPasswordValid = await comparePassword(password, userDoc.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    // Use the virtual 'id' getter from the Mongoose model
    const userObject = userDoc.toObject({ virtuals: true }) as User & { _id: any };
    
    const tokenPayload = {
      id: userObject.id,
      email: userObject.email,
      displayName: userObject.displayName,
      role: userObject.role,
      avatar: userObject.avatar,
    };
    
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // This is the sanitized user data for the client-side cookie
    const clientUserData = { ...tokenPayload };

    const response = NextResponse.json({ 
        success: true, 
        message: 'Login successful.',
        user: clientUserData,
    });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    // This cookie is readable by the client to populate the user context
    response.cookies.set('user-data', JSON.stringify(clientUserData), {
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
