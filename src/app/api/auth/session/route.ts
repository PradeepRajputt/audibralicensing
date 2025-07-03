
import { NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';

const SESSION_COOKIE_NAME = 'session';
const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds

/**
 * Exchanges a Firebase ID token for a session cookie.
 */
export async function POST(request: Request) {
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ success: false, error: 'ID token is required' }, { status: 400 });
  }

  try {
    // Verify the ID token and create a session cookie
    await admin.auth().verifyIdToken(idToken);
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ success: true, status: 'signedIn' });
    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn / 1000,
      path: '/',
    });
    return response;

  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({ success: false, error: 'Failed to create session' }, { status: 401 });
  }
}


/**
 * Clears the session cookie.
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true, status: 'signedOut' });
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1, 
    path: '/',
  });
  return response;
}
