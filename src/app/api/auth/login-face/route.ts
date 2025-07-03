
'use server';

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getAllUsers } from '@/lib/users-store';
import { FaceMatcher, LabeledFaceDescriptors } from 'face-api.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-prototype';
const FACE_MATCH_THRESHOLD = 0.5; // Stricter threshold for better accuracy

export async function POST(req: NextRequest) {
  try {
    const { faceDescriptor } = await req.json();

    if (!Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
        return NextResponse.json({ message: 'Invalid face descriptor received.' }, { status: 400 });
    }
    
    // In a real app, you would not fetch all users. You'd use a more optimized
    // vector search database. For this prototype, we fetch all.
    const allUsers = await getAllUsers();
    
    if (allUsers.length === 0) {
       return NextResponse.json({ message: 'No registered users found.' }, { status: 404 });
    }
    
    const labeledFaceDescriptors = allUsers.map(user => 
        new LabeledFaceDescriptors(
            user.id, [new Float32Array(user.faceDescriptor)]
        )
    );
    
    const faceMatcher = new FaceMatcher(labeledFaceDescriptors, FACE_MATCH_THRESHOLD);
    const bestMatch = faceMatcher.findBestMatch(new Float32Array(faceDescriptor));

    if (bestMatch.label === 'unknown') {
        return NextResponse.json({ message: 'No matching face found. Please try again.' }, { status: 401 });
    }

    const matchedUser = allUsers.find(u => u.id === bestMatch.label);

    if (!matchedUser) {
        return NextResponse.json({ message: 'Authentication failed. User data not found.' }, { status: 500 });
    }

    const tokenPayload = {
      id: matchedUser.id,
      email: matchedUser.email,
      displayName: matchedUser.displayName,
      role: matchedUser.role,
      avatar: matchedUser.avatar,
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

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
    
    response.cookies.set('user-data', JSON.stringify(clientUserData), {
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Face login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
